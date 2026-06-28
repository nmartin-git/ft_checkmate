require("dotenv").config();

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const {
  legalMoves, applyMove, isDrawByMaterial, enemyColor, makeFreshBoard,
} = require("./src/lib/checkers.js");

const TURN_SECONDS = 30;    
const DRAW_NO_CAPTURE = 10;   

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);
  const rooms = {};

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


      if (lm.type === "capture") room.noCapture = 0;
      else room.noCapture++;

      room.turn = enemyColor(room.turn);

      const animation = lm.type === "capture" ? { path: match.path, captured: match.captured } : null;
      io.to(roomId).emit("state", { board: room.board, turn: room.turn, animation });


      const nextMoves = legalMoves(room.board, room.turn);
      if (nextMoves.moves.length === 0) {
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: pColor, reason: "blocked" });
        return;
      }
      if (isDrawByMaterial(room.board)) {
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: null, reason: "draw-material" });
        return;
      }
      if (room.noCapture >= DRAW_NO_CAPTURE * 2) {
        room.ended = true; stopTimer(roomId);
        io.to(roomId).emit("gameover", { winner: null, reason: "draw-nocapture" });
        return;
      }

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