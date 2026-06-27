'use client';

import { useState, useEffect } from 'react';
import {
  makeFreshBoard,
  legalMoves,
  applyMove,
  isDrawByMaterial,
  findMove,
  enemyColor,
} from "@/src/lib/checkers.js";

type Pos = { row: number; col: number };

export default function LocalGamePage() {
  const [board, setBoard] = useState<number[][]>(() => makeFreshBoard());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white"); // blancs commencent
  const [over, setOver] = useState<{ winner: string | null; reason: string } | null>(null);
  const [eatenByBlack, setEatenByBlack] = useState(0);
  const [eatenByWhite, setEatenByWhite] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // chrono qui monte
  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [over]);

  function showError(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 2500);
  }

  function countPieces(b: number[][]) {
    let black = 0, white = 0;
    for (const row of b) for (const v of row) {
      if (v === 1 || v === 3) black++;
      else if (v === 2 || v === 4) white++;
    }
    return { black, white };
  }

  function handleClick(row: number, col: number) {
    if (over) return;
    const v = board[row][col];
    const mine = (turn === "black" && (v === 1 || v === 3)) ||
                 (turn === "white" && (v === 2 || v === 4));

    if (selected === null) {
      if (mine) setSelected({ row, col });
      return;
    }
    if (mine) { setSelected({ row, col }); return; } // changer de sélection

    // tenter le coup via le moteur partagé
    const move = findMove(board, turn, selected, { row, col });
    if (!move) {
      const lm = legalMoves(board, turn);
      showError(lm.type === "capture"
        ? "Prise obligatoire : prends le maximum de pions"
        : "Coup invalide");
      return;
    }

    // appliquer sur une copie
    const nb = board.map(r => r.slice());
    applyMove(nb, move, move.type);

    // compteur de pièces mangées
    const { black, white } = countPieces(nb);
    setEatenByWhite(12 - black);
    setEatenByBlack(12 - white);

    const nextTurn = enemyColor(turn) as "white" | "black";
    setBoard(nb);
    setSelected(null);
    setTurn(nextTurn);

    // conditions de fin
    const nextMoves = legalMoves(nb, nextTurn);
    if (nextMoves.moves.length === 0) {
      setOver({ winner: turn, reason: "blocked" });
    } else if (isDrawByMaterial(nb)) {
      setOver({ winner: null, reason: "draw-material" });
    }
  }

  function resetGame() {
    setBoard(makeFreshBoard());
    setSelected(null);
    setTurn("white");
    setOver(null);
    setSeconds(0);
    setEatenByBlack(0);
    setEatenByWhite(0);
  }

  const turnFr = turn === "black" ? "Noir" : "Blanc";

  return (
    <div className="flex flex-col justify-start items-center min-h-[calc(100vh-64px)] bg-slate-900 p-4 pt-12">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-widest text-center uppercase drop-shadow-md">
        Jeu de Dames
      </h1>

      <div className="flex gap-4 mb-4 flex-wrap justify-center">
        <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-white shadow-md flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse"></span>
          Tour : <span className={turn === "black" ? "text-amber-500 font-bold" : "text-sky-400 font-bold"}>{turnFr}</span>
        </div>
        <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-white shadow-md flex items-center gap-2">
          ⏱️ Temps : <span className="font-mono font-bold text-yellow-500">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
        </div>
      </div>

      <div className={`mb-4 h-8 transition-opacity ${errorMsg ? "opacity-100" : "opacity-0"}`}>
        <span className="bg-red-700 text-white font-bold px-4 py-1.5 rounded-md">{errorMsg || "."}</span>
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700/50">
        <div className="text-white text-center bg-slate-950 p-4 rounded-xl border border-amber-500/20 w-44 shadow-inner">
          <p className="font-bold text-amber-500 text-lg">Joueur Noir</p>
          <p className="text-slate-400 mt-1 text-sm">Mangées : <span className="text-white font-extrabold text-base">{eatenByBlack}</span></p>
        </div>

        <div className="grid grid-cols-8 border-4 border-slate-950 shadow-2xl rounded-lg overflow-hidden bg-slate-950" style={{ width: "400px", height: "400px" }}>
          {board.map((rowData, rowIndex) =>
            rowData.map((colData, colIndex) => {
              const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
              const isDarkCell = (rowIndex + colIndex) % 2 === 0;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`relative flex justify-center items-center cursor-pointer select-none transition-all duration-150 ${isDarkCell ? "bg-amber-900 hover:bg-amber-800" : "bg-amber-100"} ${isSelected ? "ring-4 ring-yellow-400 z-10 scale-95" : ""}`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                  style={{ width: "50px", height: "50px" }}
                >
                  {colData === 1 && <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-xl"></div>}
                  {colData === 2 && <div className="w-9 h-9 rounded-full bg-neutral-100 border-2 border-neutral-300 shadow-xl"></div>}
                  {colData === 3 && <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-yellow-400 shadow-xl flex items-center justify-center text-xs animate-pulse">👑</div>}
                  {colData === 4 && <div className="w-9 h-9 rounded-full bg-neutral-100 border-2 border-yellow-500 shadow-xl flex items-center justify-center text-xs animate-pulse">👑</div>}
                </div>
              );
            })
          )}
        </div>

        <div className="text-white text-center bg-slate-950 p-4 rounded-xl border border-sky-500/20 w-44 shadow-inner">
          <p className="font-bold text-sky-400 text-lg">Joueur Blanc</p>
          <p className="text-slate-400 mt-1 text-sm">Mangées : <span className="text-white font-extrabold text-base">{eatenByWhite}</span></p>
        </div>

        {over && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center rounded-2xl gap-4 z-20">
            <h2 className="text-4xl font-extrabold" style={{ color: over.winner === null ? "#d97706" : (over.winner === "black" ? "#f59e0b" : "#38bdf8") }}>
              {over.winner === null ? "Match nul" : `${over.winner === "black" ? "Noir" : "Blanc"} gagne !`}
            </h2>
            <p className="text-white text-lg">
              {over.winner === null
                ? (over.reason === "draw-material" ? "Dame contre dame." : "Partie nulle.")
                : "Plus aucun coup possible pour l'adversaire."}
            </p>
            <button onClick={resetGame} className="px-7 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg">Rejouer</button>
          </div>
        )}
      </div>
    </div>
  );
}