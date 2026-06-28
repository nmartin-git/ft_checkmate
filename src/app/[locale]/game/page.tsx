'use client';

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

type Cell = number;
type Pos = { row: number; col: number };

export default function OnlineGamePage() {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [myColor, setMyColor] = useState<"black" | "white" | null>(null);
  const [turn, setTurn] = useState<"black" | "white" | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [eatenByBlack, setEatenByBlack] = useState(0);
  const [eatenByWhite, setEatenByWhite] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [over, setOver] = useState<{ winner: string | null; reason: string } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function countPieces(b: Cell[][]) {
    let black = 0, white = 0;
    for (const row of b) for (const v of row) {
      if (v === 1 || v === 3) black++;
      else if (v === 2 || v === 4) white++;
    }
    return { black, white };
  }

  useEffect(() => {
    const socket = io({ forceNew: true, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("init", (data) => {
      setMyColor(data.color);
      setBoard(data.board);
      setTurn(data.turn);
      setOver(null);
      setEatenByBlack(0);
      setEatenByWhite(0);
    });

    socket.on("state", (data) => {
      const { black, white } = countPieces(data.board);
      setEatenByWhite(12 - black);
      setEatenByBlack(12 - white);
      setBoard(data.board);
      setTurn(data.turn);
      setSelected(null);
    });

    socket.on("timer", (data) => setTimeLeft(data.timeLeft));
    socket.on("gameover", (data) => setOver({ winner: data.winner, reason: data.reason }));
    socket.on("error", (data) => showError(data.message));
    socket.on("full", (data) => showError(data.message));

    return () => { socket.disconnect(); };
  }, []);

  function showError(msg: string) {
    setErrorMsg(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorMsg(""), 3000);
  }

  function handleClick(row: number, col: number) {
    if (over || turn !== myColor) return;
    const v = board[row][col];
    const mine = (myColor === "black" && (v === 1 || v === 3)) ||
                 (myColor === "white" && (v === 2 || v === 4));
    if (selected === null) {
      if (mine) setSelected({ row, col });
    } else if (mine) {
      setSelected({ row, col });
    } else {
      socketRef.current?.emit("move", { from: selected, to: { row, col } });
    }
  }

  function requestRestart() {
    socketRef.current?.emit("restart");
    setOver(null);
  }

  const myTurn = turn === myColor;
  const colorFr = myColor === "black" ? "Noir" : "Blanc";
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
          Temps : <span className={`font-mono font-bold ${myTurn && timeLeft !== null && timeLeft <= 5 ? "text-red-500" : "text-yellow-500"}`}>{timeLeft !== null ? `${timeLeft}s` : "—"}</span>
        </div>
        <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-white shadow-md flex items-center gap-2">
          Tu joues : <span className={myColor === "black" ? "text-amber-500 font-bold" : "text-sky-400 font-bold"}>{myColor ? colorFr : "…"}</span>
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
            <h2 className="text-4xl font-extrabold" style={{ color: over.winner === null ? "#d97706" : (over.winner === myColor ? "#16a34a" : "#dc2626") }}>
              {over.winner === null ? "Match nul" : (over.winner === myColor ? "Victoire !" : "Défaite")}
            </h2>
            <p className="text-white text-lg">
              {over.winner === null
                ? (over.reason === "draw-material" ? "Dame contre dame." : "Trop de tours sans prise.")
                : (over.reason === "timeout" ? "Temps écoulé." : `Les ${over.winner === "black" ? "Noirs" : "Blancs"} gagnent.`)}
            </p>
            <button onClick={requestRestart} className="px-7 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg">Rejouer</button>
          </div>
        )}
      </div>
    </div>
  );
}
