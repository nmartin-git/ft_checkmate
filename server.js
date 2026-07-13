require("dotenv").config(); // charge .env (JWT_SECRET, DATABASE_URL, etc.) quand on lance node server.js

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: false });
const handle = app.getRequestHandler();

// ════════ MOTEUR DE DAMES (partagé avec le mode local) ════════
const {
  legalMoves, applyMove, isDrawByMaterial, enemyColor, makeFreshBoard,
} = require("./src/lib/checkers.js");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ── auth : retrouve l'utilisateur à partir du cookie auth-token ──
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret-a-changer");

async function getUserIdFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const entry = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth-token="));
  if (!entry) return null;
  const token = decodeURIComponent(entry.slice("auth-token=".length));
  try {
    const { jwtVerify } = await import("jose"); // jose est ESM → import dynamique en CommonJS
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id;
  } catch {
    return null;
  }
}

function toResult(winner){
  if (winner==='white') return "WHITE";
  if (winner==='black') return "BLACK";
  return "DRAW";
}

async function pushResult(gameId, winner){
  try {
    await fetch('http://localhost:3000/api/game/result', {
      method : "POST",
      headers : {"Content-Type" : "application/json"},
      body : JSON.stringify({gameId, result: toResult(winner),secret :process.env.GAME_SERVER_SECRET})
    });
  } catch (error) {
    console.error("pushResult",error);
  }
}

// ════════ SERVEUR ════════
const TURN_SECONDS = 30;       // temps par tour
const DRAW_NO_CAPTURE = 10;    // nulle après X tours sans prise

app.prepare().then(async() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);
  const rooms = {};
  const onlineUsers = new Map();

  // démarre / redémarre le compte à rebours du tour courant d'une room
  function startTimer(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    if (room.timer) clearInterval(room.timer);
    room.timeLeft = TURN_SECONDS;
    io.to(roomId).emit("timer", { timeLeft: room.timeLeft, turn: room.turn });
    room.timer = setInterval(() => {
      room.timeLeft--;
      io.to(roomId).emit("timer", { timeLeft: room.timeLeft, turn: room.turn });
      if (room.timeLeft <= 0) {
        clearInterval(room.timer);
        room.timer = null;
        // le joueur dont c'est le tour perd par forfait
        const loser = room.turn;
        const winner = enemyColor(loser);
        room.ended = true;
        io.to(roomId).emit("gameover", { winner, reason: "timeout" });
        pushResult(roomId, winner);
      }
    }, 1000);
  }



  function stopTimer(roomId) {
    const room = rooms[roomId];
    if (room && room.timer) { clearInterval(room.timer); room.timer = null; }
  }

  io.on("connection", async (socket) => {

  // ── Connexion "présence" (pas de partie) ──
  const userId = await getUserIdFromCookie(socket.handshake.headers.cookie);
  const gameId = socket.handshake.query.gameId;
  if (!gameId) {
    if (!userId) return; // pas connecté → on ignore

    // +1 dans SON casier
    const count = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, count + 1);

    // si on passe de 0 à 1 → il vient d'arriver
    if (count === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { is_online: true },
      });
      // io.emit("presence:update", { userId, isOnline: true });  // à la connexion 
      // (Étape 4 : prévenir ses amis ici)
    }

    socket.on("disconnect", async () => {
      const c = onlineUsers.get(userId) || 0;
      if (c <= 1) {
        onlineUsers.delete(userId);
        await prisma.user.update({
          where: { id: userId },
          data: { is_online: false },
        });
        // (Étape 4 : prévenir ses amis ici)
        // io.emit("presence:update", { userId, isOnline: false });  // à la connexion 
      } else {
        onlineUsers.set(userId, c - 1); // encore d'autres onglets
      }
    });

    return; // ← important : on ne va PAS dans le code du jeu
  }
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      socket.emit("error", { message: "Game not found" });
      return;
    }

    // la couleur vient de la BASE, pas de l'ordre d'arrivée
    let color;
    if (userId === game.white_player_id) color = "white";
    else if (userId === game.black_player_id) color = "black";
    else {
      socket.emit("error", { message: "UserId not in the game" });
      return;
    }

    if (!rooms[gameId]) {
      rooms[gameId] = { board: makeFreshBoard(), turn: "white", players: {}, noCapture: 0, ended: false, timer: null, timeLeft: TURN_SECONDS };
    }
    const room = rooms[gameId];

    // refuse une 3e connexion (partie déjà pleine)
    if (!room.players[socket.id] && Object.keys(room.players).length >= 2) {
      socket.emit("full", { message: "La partie est déjà pleine" });
      return;
    }

    room.players[socket.id] = color;
    socket.join(gameId);
    console.log(`[socket] ${socket.id} rejoint ${gameId} en ${color}`);
    socket.emit("init", { color, board: room.board, turn: room.turn });

    // quand les 2 joueurs sont là, on lance le timer
    if (Object.keys(room.players).length === 2 && !room.ended) {
      startTimer(gameId);
    }

    socket.on("move", ({ from, to }) => {
      const pColor = room.players[socket.id];
      if (room.ended) return;
      if (pColor !== room.turn) { socket.emit("error", { message: "Ce n'est pas ton tour" }); return; }

      const lm = legalMoves(room.board, pColor);
      const match = lm.moves.find(m => {
        const start = m.from;
        const end = lm.type === "capture" ? m.path[m.path.length - 1] : m.to;
        return start.row === from.row && start.col === from.col && end.row === to.row && end.col === to.col;
      });
      if (!match) {
        const why = lm.type === "capture" ? "Prise obligatoire : tu dois prendre le maximum de pions" : "Coup invalide";
        socket.emit("error", { message: why });
        return;
      }

      applyMove(room.board, match, lm.type);

      // compteur de tours sans prise (pour la nulle)
      if (lm.type === "capture") room.noCapture = 0;
      else room.noCapture++;

      room.turn = enemyColor(room.turn);

      const animation = lm.type === "capture" ? { path: match.path, captured: match.captured } : null;
      io.to(gameId).emit("state", { board: room.board, turn: room.turn, animation });

      // ── conditions de fin ──
      // 1. victoire : l'adversaire n'a plus de coups
      const nextMoves = legalMoves(room.board, room.turn);
      if (nextMoves.moves.length === 0) {
        room.ended = true; stopTimer(gameId);
        io.to(gameId).emit("gameover", { winner: pColor, reason: "blocked" });
        pushResult(gameId, pColor);
        return;
      }
      // 2. nulle par matériel (dame vs dame)
      if (isDrawByMaterial(room.board)) {
        room.ended = true; stopTimer(gameId);
        io.to(gameId).emit("gameover", { winner: null, reason: "draw-material" });
        pushResult(gameId, null);
        return;
      }
      // 3. nulle par inaction (X tours sans prise)
      if (room.noCapture >= DRAW_NO_CAPTURE * 2) { // *2 car 1 tour = 1 coup par couleur
        room.ended = true; stopTimer(gameId);
        io.to(gameId).emit("gameover", { winner: null, reason: "draw-nocapture" });
        pushResult(gameId, null);
        return;
      }
      // sinon : on relance le timer pour le joueur suivant
      startTimer(gameId);
    });

    socket.on("restart", () => {
      room.board = makeFreshBoard();
      room.turn = "white";
      room.noCapture = 0;
      room.ended = false;
      io.to(gameId).emit("state", { board: room.board, turn: room.turn, animation: null });
      if (Object.keys(room.players).length === 2) startTimer(gameId);
    });

    socket.on("disconnect", () => {
      delete room.players[socket.id];
      console.log(`[socket] ${socket.id} déconnecté`);
      stopTimer(gameId);
      if (Object.keys(room.players).length === 0) delete rooms[gameId];
    });
  });
  await prisma.user.updateMany({ data: { is_online: false } });
  const PORT = 3000;
  httpServer.listen(PORT, () => console.log(`> Serveur prêt sur http://localhost:${PORT}`));
});