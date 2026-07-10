let gameBoard = [];
let selected = null;
let myColor = null;
let currentTurn = null;
let mySocket = null;
let gameEnded = false;

function updateInfo() {
  const info = document.getElementById("game-info");
  if (!info) return;
  const colorFr = myColor === "black" ? "Noirs" : "Blancs";
  const turnFr = currentTurn === "black" ? "Noirs" : "Blancs";
  const myTurn = currentTurn === myColor;
  info.textContent =
    `Tu joues les ${colorFr} — Tour des ${turnFr}` +
    (myTurn ? " (à toi de jouer !)" : " (attends ton tour)");
  info.style.color = myTurn ? "#7CFC00" : "#ddd";
}

// affiche un message d'erreur temporaire sur la page
let errorTimer = null;
function showError(msg) {
  const box = document.getElementById("game-error");
  if (!box) return;
  box.textContent = msg;
  box.style.opacity = "1";
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => { box.style.opacity = "0"; }, 3000);
}

// affiche le compte à rebours du tour
function updateTimer(timeLeft, turn) {
  const el = document.getElementById("game-timer");
  if (!el) return;
  const myTurn = turn === myColor;
  el.textContent = `${timeLeft}s`;
  // rouge si c'est mon tour et qu'il reste peu de temps
  if (myTurn && timeLeft <= 5) el.style.color = "#dc2626";
  else if (myTurn) el.style.color = "#7CFC00";
  else el.style.color = "#bbb";
}

function showGameOver(winner, reason) {
  gameEnded = true;
  const overlay = document.getElementById("game-over");
  if (!overlay) return;

  const title = document.getElementById("game-over-title");
  const sub = document.getElementById("game-over-sub");

  if (winner === null) {
    // partie nulle
    title.textContent = "Match nul";
    title.style.color = "#d97706";
    sub.textContent = reason === "draw-material"
      ? "Aucun camp ne peut gagner (dame contre dame)."
      : "Trop de tours sans prise.";
  } else {
    const winnerFr = winner === "black" ? "Noirs" : "Blancs";
    const iWon = winner === myColor;
    title.textContent = iWon ? "Victoire !" : "Défaite";
    title.style.color = iWon ? "#16a34a" : "#dc2626";
    if (reason === "timeout") {
      sub.textContent = iWon
        ? `Les ${winnerFr} gagnent : l'adversaire n'a pas joué à temps.`
        : `Défaite : temps écoulé, tu n'as pas joué à temps.`;
    } else {
      sub.textContent = `Les ${winnerFr} gagnent la partie.`;
    }
  }

  overlay.style.display = "flex";
}

// appelée par le bouton "Rejouer"
export function requestRestart() {
  if (mySocket) mySocket.emit("restart");
  const overlay = document.getElementById("game-over");
  if (overlay) overlay.style.display = "none";
  gameEnded = false;
}

export function initGame(socket) {
  mySocket = socket;
  socket.on("init", (data) => {
    myColor = data.color;
    gameBoard = data.board;
    currentTurn = data.turn;
    gameEnded = false;
    drawboard();
    updateInfo();
  });
  socket.on("state", (data) => {
    selected = null;
    currentTurn = data.turn;
    // si une nouvelle partie démarre, on s'assure que l'écran de fin est caché
    if (gameEnded) {
      gameEnded = false;
      const overlay = document.getElementById("game-over");
      if (overlay) overlay.style.display = "none";
    }

    if (data.animation && data.animation.captured && data.animation.captured.length >= 2) {
      // prise MULTIPLE (2+ pions) : on anime saut par saut
      animateCapture(data.animation, data.board);
    } else {
      // coup simple OU prise d'un seul pion : affichage direct (même vitesse)
      gameBoard = data.board;
      drawboard();
      updateInfo();
    }
  });
  socket.on("error", (data) => showError(data.message));
  socket.on("full", (data) => showError(data.message));
  socket.on("gameover", (data) => showGameOver(data.winner, data.reason));
  socket.on("timer", (data) => updateTimer(data.timeLeft, data.turn));
}

// Anime une rafle saut par saut.
// finalBoard = état après toute la rafle (reçu du serveur)
// anim.path = [caseDepart, caseSaut1, caseSaut2, ...]
// anim.captured = pions mangés (on les remet pour rejouer, puis on les retire un à un)
function animateCapture(anim, finalBoard) {
  const path = anim.path;
  const captured = anim.captured;

  // 1. reconstruire le board AU DÉBUT de la rafle :
  //    on copie le board final, on remet la pièce au départ,
  //    et on ressuscite tous les pions mangés.
  const work = finalBoard.map(r => r.slice());
  const start = path[0];
  const end = path[path.length - 1];
  const movingPiece = work[end.row][end.col]; // la pièce (éventuellement promue dame)
  work[start.row][start.col] = movingPiece;   // remise au départ
  work[end.row][end.col] = 0;                  // vide l'arrivée

  // ressusciter les pions mangés (on devine leur couleur : adversaire du joueur courant)
  // movingPiece appartient au joueur qui vient de jouer -> les mangés sont l'ennemi
  const moverIsBlack = movingPiece === 1 || movingPiece === 3;
  const enemyPawn = moverIsBlack ? 2 : 1;
  for (const cap of captured) {
    work[cap.row][cap.col] = enemyPawn;
  }

  // 2. afficher cet état initial
  gameBoard = work;
  drawboard();

  // 3. rejouer chaque saut avec une pause
  let step = 0;
  const STEP_MS = 450;
  function nextStep() {
    if (step >= path.length - 1) {
      // fini : on cale sur le board final officiel
      gameBoard = finalBoard;
      drawboard();
      updateInfo();
      return;
    }
    const cur = path[step];
    const nxt = path[step + 1];
    // déplacer la pièce d'une étape
    gameBoard[nxt.row][nxt.col] = gameBoard[cur.row][cur.col];
    gameBoard[cur.row][cur.col] = 0;
    // retirer le pion mangé entre cur et nxt (s'il y en a un)
    const cap = captured.find(c => isBetween(cur, nxt, c));
    if (cap) gameBoard[cap.row][cap.col] = 0;
    drawboard();
    step++;
    setTimeout(nextStep, STEP_MS);
  }
  setTimeout(nextStep, STEP_MS);
}

// vrai si la case `mid` est sur le segment diagonal entre `a` et `b`
function isBetween(a, b, mid) {
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  let r = a.row + dr, c = a.col + dc;
  while (r !== b.row || c !== b.col) {
    if (r === mid.row && c === mid.col) return true;
    r += dr; c += dc;
  }
  return false;
}

export function drawboard() {
  let board = document.getElementById("board");
  if (!board) return;
  board.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 8; j++) {
      let piece = document.createElement("div");
      let cell = document.createElement("div");
      cell.classList.add("cell");

      if ((i + j) % 2 === 0) {
        cell.classList.add("cell-dark");
        const v = gameBoard[i][j];
        if (v === 1) { piece.classList.add("piece", "black"); cell.appendChild(piece); }
        else if (v === 2) { piece.classList.add("piece", "white"); cell.appendChild(piece); }
        else if (v === 3) { piece.classList.add("piece", "black", "king"); cell.appendChild(piece); }
        else if (v === 4) { piece.classList.add("piece", "white", "king"); cell.appendChild(piece); }
      } else {
        cell.classList.add("cell-light");
      }

      if (selected && selected.row === i && selected.col === j)
        cell.classList.add("selected");

      cell.addEventListener("click", () => handleClick(i, j));
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

function handleClick(row, col) {
  if (gameEnded) return;
  if (currentTurn !== myColor) return;

  const v = gameBoard[row][col];
  const mine = (myColor === "black" && (v === 1 || v === 3)) ||
               (myColor === "white" && (v === 2 || v === 4));

  if (selected === null) {
    // rien de sélectionné : on sélectionne une de ses pièces
    if (mine) {
      selected = { row, col };
      drawboard();
    }
  } else if (mine) {
    // une pièce est déjà sélectionnée et on clique une AUTRE de ses pièces
    // -> on change simplement de sélection
    selected = { row, col };
    drawboard();
  } else {
    // on tente le coup. On NE déselectionne PAS ici :
    // - si le serveur valide -> l'event "state" fera selected = null
    // - si le serveur refuse -> la pièce reste sélectionnée, on peut retenter
    mySocket.emit("move", { from: selected, to: { row, col } });
  }
}