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

// ════════ SERVEUR ════════
const TURN_SECONDS = 30;       // temps par tour
const DRAW_NO_CAPTURE = 10;    // nulle après X tours sans prise

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);
  const rooms = {};

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
      }
    }, 1000);
  }

  function stopTimer(roomId) {
    const room = rooms[roomId];
    if (room && room.timer) { clearInterval(room.timer); room.timer = null; }
  }

  io.on("connection", (socket) => {
    const roomId = "game-1";
    if (!rooms[roomId]) {
      rooms[roomId] = { board: makeFreshBoard(), turn: "white", players: {}, noCapture: 0, ended: false, timer: null, timeLeft: TURN_SECONDS };
    }
    const room = rooms[roomId];
    const nb = Object.keys(room.players).length;
    if (nb >= 2) { socket.emit("full", { message: "La partie est déjà pleine" }); return; }

    const color = nb === 0 ? "white" : "black";
    room.players[socket.id] = color;
    socket.join(roomId);
    console.log(`[socket] ${socket.id} rejoint en ${color}`);
    socket.emit("init", { color, board: room.board, turn: room.turn });

    // quand les 2 joueurs sont là, on lance le timer
    if (Object.keys(room.players).length === 2 && !room.ended) {
      startTimer(roomId);
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
      io.to(roomId).emit("state", { board: room.board, turn: room.turn, animation });

      // ── conditions de fin ──
      // 1. victoire : l'adversaire n'a plus de coups
      const nextMoves = legalMoves(room.board, room.turn);
      if (nextMoves.moves.length === 0) {
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: pColor, reason: "blocked" });
        return;
      }
      // 2. nulle par matériel (dame vs dame)
      if (isDrawByMaterial(room.board)) {
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: null, reason: "draw-material" });
        return;
      }
      // 3. nulle par inaction (X tours sans prise)
      if (room.noCapture >= DRAW_NO_CAPTURE * 2) { // *2 car 1 tour = 1 coup par couleur
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: null, reason: "draw-nocapture" });
        return;
      }
      // sinon : on relance le timer pour le joueur suivant
      startTimer(roomId);
    });

    socket.on("restart", () => {
      room.board = makeFreshBoard();
      room.turn = "white";
      room.noCapture = 0;
      room.ended = false;
      io.to(roomId).emit("state", { board: room.board, turn: room.turn, animation: null });
      if (Object.keys(room.players).length === 2) startTimer(roomId);
    });

    socket.on("disconnect", () => {
      delete room.players[socket.id];
      console.log(`[socket] ${socket.id} déconnecté`);
      stopTimer(roomId);
      if (Object.keys(room.players).length === 0) delete rooms[roomId];
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, () => console.log(`> Serveur prêt sur http://localhost:${PORT}`));
});