const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// ════════ MOTEUR DE DAMES ════════
// 0 vide | 1 pion noir | 2 pion blanc | 3 dame noire | 4 dame blanche
const DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const isBlackPiece = v => v === 1 || v === 3;
const isWhitePiece = v => v === 2 || v === 4;
const isKing = v => v === 3 || v === 4;
const pieceColor = v => isBlackPiece(v) ? "black" : (isWhitePiece(v) ? "white" : null);
const enemyColor = c => c === "black" ? "white" : "black";
const inB = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

function simpleCapturesFrom(board, r, c) {
  const v = board[r][c], color = pieceColor(v);
  if (!color) return [];
  const enemy = enemyColor(color), out = [];
  if (!isKing(v)) {
    for (const [dr, dc] of DIRS) {
      const mr = r + dr, mc = c + dc, tr = r + 2 * dr, tc = c + 2 * dc;
      if (!inB(tr, tc) || board[tr][tc] !== 0) continue;
      if (pieceColor(board[mr][mc]) === enemy)
        out.push({ to: { row: tr, col: tc }, captured: { row: mr, col: mc } });
    }
  } else {
    for (const [dr, dc] of DIRS) {
      let k = 1, found = null;
      while (true) {
        const rr = r + k * dr, cc = c + k * dc;
        if (!inB(rr, cc)) break;
        const cell = board[rr][cc];
        if (cell === 0) { if (found) out.push({ to: { row: rr, col: cc }, captured: found }); k++; continue; }
        if (pieceColor(cell) === enemy) { if (found) break; found = { row: rr, col: cc }; k++; continue; }
        break;
      }
    }
  }
  return out;
}

function applyStep(board, from, to, captured) {
  const nb = board.map(row => row.slice());
  nb[to.row][to.col] = nb[from.row][from.col];
  nb[from.row][from.col] = 0;
  if (captured) nb[captured.row][captured.col] = 0;
  return nb;
}

function captureSequences(board, r, c) {
  const results = [];
  function recurse(b, cr, cc, capList, cellList) {
    const caps = simpleCapturesFrom(b, cr, cc)
      .filter(cap => !capList.some(p => p.row === cap.captured.row && p.col === cap.captured.col));
    if (caps.length === 0) {
      if (capList.length > 0) results.push({ path: cellList.slice(), captured: capList.slice() });
      return;
    }
    for (const cap of caps) {
      const nb = applyStep(b, { row: cr, col: cc }, cap.to, cap.captured);
      recurse(nb, cap.to.row, cap.to.col, [...capList, cap.captured], [...cellList, cap.to]);
    }
  }
  recurse(board, r, c, [], [{ row: r, col: c }]);
  return results;
}

function simpleMovesFrom(board, r, c) {
  const v = board[r][c], color = pieceColor(v);
  if (!color) return [];
  const out = [];
  if (!isKing(v)) {
    const fwd = color === "black" ? 1 : -1;
    for (const dc of [1, -1]) {
      const tr = r + fwd, tc = c + dc;
      if (inB(tr, tc) && board[tr][tc] === 0) out.push({ row: tr, col: tc });
    }
  } else {
    for (const [dr, dc] of DIRS) {
      let k = 1;
      while (true) {
        const rr = r + k * dr, cc = c + k * dc;
        if (!inB(rr, cc) || board[rr][cc] !== 0) break;
        out.push({ row: rr, col: cc }); k++;
      }
    }
  }
  return out;
}

function legalMoves(board, color) {
  let seqs = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (pieceColor(board[r][c]) === color)
      for (const s of captureSequences(board, r, c)) seqs.push({ from: { row: r, col: c }, ...s });
  if (seqs.length > 0) {
    const max = Math.max(...seqs.map(s => s.captured.length));
    return { type: "capture", moves: seqs.filter(s => s.captured.length === max) };
  }
  const simple = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (pieceColor(board[r][c]) === color)
      for (const to of simpleMovesFrom(board, r, c)) simple.push({ from: { row: r, col: c }, to });
  return { type: "simple", moves: simple };
}

function promote(board) {
  for (let c = 0; c < 8; c++) {
    if (board[7][c] === 1) board[7][c] = 3;
    if (board[0][c] === 2) board[0][c] = 4;
  }
}

function applyMove(board, move, type) {
  if (type === "simple") {
    board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
    board[move.from.row][move.from.col] = 0;
  } else {
    let cur = move.from;
    for (let i = 1; i < move.path.length; i++) {
      const nxt = move.path[i];
      board[nxt.row][nxt.col] = board[cur.row][cur.col];
      board[cur.row][cur.col] = 0;
      cur = nxt;
    }
    for (const cap of move.captured) board[cap.row][cap.col] = 0;
  }
  promote(board);
}

// ════════ SERVEUR ════════
app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);
  const rooms = {};

  function makeFreshBoard() {
    return [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 2, 0, 2, 0, 2, 0, 2],
    ];
  }

  io.on("connection", (socket) => {
    const roomId = "game-1";
    if (!rooms[roomId]) rooms[roomId] = { board: makeFreshBoard(), turn: "white", players: {} };
    const room = rooms[roomId];
    const nb = Object.keys(room.players).length;
    if (nb >= 2) { socket.emit("full", { message: "La partie est déjà pleine" }); return; }

    const color = nb === 0 ? "white" : "black";
    room.players[socket.id] = color;
    socket.join(roomId);
    console.log(`[socket] ${socket.id} rejoint en ${color}`);
    socket.emit("init", { color, board: room.board, turn: room.turn });

    socket.on("move", ({ from, to }) => {
      const pColor = room.players[socket.id];
      if (pColor !== room.turn) { socket.emit("error", { message: "Ce n'est pas ton tour" }); return; }

      const lm = legalMoves(room.board, pColor);
      const match = lm.moves.find(m => {
        const start = m.from;
        const end = lm.type === "capture" ? m.path[m.path.length - 1] : m.to;
        return start.row === from.row && start.col === from.col && end.row === to.row && end.col === to.col;
      });
      if (!match) {
        const why = lm.type === "capture"
          ? "Prise obligatoire : tu dois prendre le maximum de pions"
          : "Coup invalide";
        socket.emit("error", { message: why });
        return;
      }
      applyMove(room.board, match, lm.type);
      room.turn = enemyColor(room.turn);

      // Pour une rafle, on envoie le chemin complet (path + pions mangés)
      // afin que le client l'anime saut par saut.
      const animation = lm.type === "capture"
        ? { path: match.path, captured: match.captured }
        : null;

      io.to(roomId).emit("state", { board: room.board, turn: room.turn, animation });

      const nextMoves = legalMoves(room.board, room.turn);
      if (nextMoves.moves.length === 0) {
        io.to(roomId).emit("gameover", { winner: pColor });
      }
    });

    socket.on("restart", () => {
      // réinitialise le plateau, blancs commencent
      room.board = makeFreshBoard();
      room.turn = "white";
      io.to(roomId).emit("state", { board: room.board, turn: room.turn, animation: null });
    });

    socket.on("disconnect", () => {
      delete room.players[socket.id];
      console.log(`[socket] ${socket.id} déconnecté`);
      if (Object.keys(room.players).length === 0) delete rooms[roomId];
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, () => console.log(`> Serveur prêt sur http://localhost:${PORT}`));
});