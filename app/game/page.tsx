'use client';

import { useState, useEffect } from 'react';

export default function GamePage() {
  const [board, setBoard] = useState<number[][]>(createInitialBoard());
  const [selected, setSelected] = useState<{row: number, col: number} | null>(null);
  const [turn, setTurn] = useState<number>(1);
  const [winner, setWinner] = useState<number>(0);
  const [eatenByBlack, setEatenByBlack] = useState<number>(0);
  const [eatenByWhite, setEatenByWhite] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (winner !== 0) return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [winner]);

  function handleClick(rowIndex: number, colIndex: number) {
    if (selected === null) {
      if (board[rowIndex][colIndex] === turn || board[rowIndex][colIndex] === turn + 2) {
        setSelected({row: rowIndex, col: colIndex});
      }
    } else {
      if (board[rowIndex][colIndex] === turn || board[rowIndex][colIndex] === turn + 2) {
        setSelected({row: rowIndex, col: colIndex});
        return;
      }
      const isDame = board[selected.row][selected.col] === 3 || board[selected.row][selected.col] === 4;
      const mustCapture = hasAnyCapture(board, turn);
      const validMove = !mustCapture &&
                  Math.abs(colIndex - selected.col) === Math.abs(rowIndex - selected.row) &&
                  (isDame ? isPathClear(selected.row, selected.col, rowIndex, colIndex, board)
                           : (Math.abs(colIndex - selected.col) === 1 &&
                             (turn === 1 ? rowIndex - selected.row === 1 : rowIndex - selected.row === -1))) &&
                  board[rowIndex][colIndex] === 0;

      const midRow = (selected.row + rowIndex) / 2;
      const midCol = (selected.col + colIndex) / 2;
      const validCapture = isDame ? isValidDameCapture(selected.row, selected.col, rowIndex, colIndex, board, turn) :
                     Math.abs(colIndex - selected.col) === 2 &&
                     Math.abs(rowIndex - selected.row) === 2 &&
                     (turn === 1 ? board[midRow][midCol] === 2 || board[midRow][midCol] === 4
                                 : board[midRow][midCol] === 1 || board[midRow][midCol] === 3) &&
                     board[rowIndex][colIndex] === 0;

      if (validMove) {
        const newBoard = board.map(row => [...row]);
        newBoard[rowIndex][colIndex] = board[selected.row][selected.col];
        newBoard[selected.row][selected.col] = 0;
        if (turn === 1 && rowIndex === 7) {
          newBoard[rowIndex][colIndex] = 3;
        }
        if (turn === 2 && rowIndex === 0) newBoard[rowIndex][colIndex] = 4;
        const w = checkWinner(newBoard);
        if (w !== 0) setWinner(w);
        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 1 ? 2 : 1);
      }

      if (validCapture) {
        const newBoard = board.map(row => [...row]);
        newBoard[rowIndex][colIndex] = board[selected.row][selected.col];
        newBoard[selected.row][selected.col] = 0;
        if (isDame) {
          const dr = rowIndex > selected.row ? 1 : -1;
          const dc = colIndex > selected.col ? 1 : -1;
          let r = selected.row + dr;
          let c = selected.col + dc;
          while (r !== rowIndex || c !== colIndex) {
            if (board[r][c] !== 0) {
              newBoard[r][c] = 0;
              break;
            }
            r += dr;
            c += dc;
          }
        } else {
          newBoard[midRow][midCol] = 0;
        }
        if (turn === 1 && rowIndex === 7) newBoard[rowIndex][colIndex] = 3;
        if (turn === 2 && rowIndex === 0) newBoard[rowIndex][colIndex] = 4;
        const w = checkWinner(newBoard);
        if (w !== 0) setWinner(w);
        if (turn === 1) setEatenByBlack(eatenByBlack + 1);
        else setEatenByWhite(eatenByWhite + 1);
        setBoard(newBoard);
        if (canCapture(rowIndex, colIndex, newBoard, turn)) {
          setSelected({row: rowIndex, col: colIndex});
        } else {
          setSelected(null);
          setTurn(turn === 1 ? 2 : 1);
        }   
      }
    }
  }

  function resetGame() {
    setBoard(createInitialBoard());
    setSelected(null);
    setTurn(1);
    setWinner(0);
    setSeconds(0);
    setEatenByBlack(0);
    setEatenByWhite(0);
  }

  return (
  <div className="flex flex-col justify-start items-center min-h-[calc(100vh-64px)] bg-slate-900 p-4 pt-12">
    {/* Titre principal bien espacé de la Topbar */}
    <h1 className="text-4xl font-extrabold text-white mb-8 tracking-widest text-center uppercase drop-shadow-md">
      Jeu de Dames
    </h1>
    
    {/* Section d'état (Gagnant ou Tour/Temps) */}
    {winner !== 0 ? (
      <div className="text-center bg-slate-800 p-5 rounded-xl shadow-lg border border-yellow-500 mb-8 animate-bounce max-w-sm w-full">
        <p className="text-2xl font-bold text-yellow-400">Joueur {winner} a gagné ! 🏆</p>
        <button onClick={resetGame} className="mt-3 px-6 py-2 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 transition-colors shadow-md">
          Rejouer
        </button>
      </div>
    ) : (
      <div className="flex gap-4 mb-8">
        <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-white shadow-md flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse"></span>
          Tour : <span className={turn === 1 ? "text-amber-500 font-bold" : "text-sky-400 font-bold"}>Joueur {turn} ({turn === 1 ? 'Noir' : 'Blanc'})</span>
        </div>
        <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-white shadow-md flex items-center gap-2">
          ⏱️ Temps : <span className="font-mono font-bold text-yellow-500">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
        </div>
      </div>
    )}

    {/* Conteneur de jeu global */}
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      {/* Score Joueur 1 */}
      <div className="text-white text-center bg-slate-950 p-4 rounded-xl border border-amber-500/20 w-44 shadow-inner">
        <p className="font-bold text-amber-500 text-lg">Joueur 1 (Noir)</p>
        <p className="text-slate-400 mt-1 text-sm">Mangées : <span className="text-white font-extrabold text-base">{eatenByBlack}</span></p>
      </div>

      {/* Le Plateau (Board) */}
      <div className="grid grid-cols-8 border-4 border-slate-950 shadow-2xl rounded-lg overflow-hidden bg-slate-950" style={{ width: '400px', height: '400px' }}>
        {board.map((rowData, rowIndex) => 
          rowData.map((colData, colIndex) => {
            const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
            const isDarkCell = (rowIndex + colIndex) % 2 === 0;
            
            return (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`relative flex justify-center items-center cursor-pointer select-none transition-all duration-150
                  ${isDarkCell ? "bg-amber-900 hover:bg-amber-800" : "bg-amber-100"} 
                  ${isSelected ? "ring-4 ring-yellow-400 z-10 scale-95 shadow-2xl" : ""}
                `}
                onClick={() => handleClick(rowIndex, colIndex)}
                style={{ width: '50px', height: '50px' }}
              >
                {/* Pièce Noire (Joueur 1) */}
                {colData === 1 && <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-xl flex items-center justify-center transform active:scale-90 transition-transform"></div>}
                {/* Pièce Blanche (Joueur 2) */}
                {colData === 2 && <div className="w-9 h-9 rounded-full bg-neutral-100 border-2 border-neutral-300 shadow-xl flex items-center justify-center transform active:scale-90 transition-transform"></div>}
                {/* Dame Noire */}
                {colData === 3 && (
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-yellow-400 shadow-xl flex items-center justify-center text-yellow-400 font-bold text-xs animate-pulse">
                    👑
                  </div>
                )}
                {/* Dame Blanche */}
                {colData === 4 && (
                  <div className="w-9 h-9 rounded-full bg-neutral-100 border-2 border-yellow-500 shadow-xl flex items-center justify-center text-yellow-600 font-bold text-xs animate-pulse">
                    👑
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Score Joueur 2 */}
      <div className="text-white text-center bg-slate-950 p-4 rounded-xl border border-sky-500/20 w-44 shadow-inner">
        <p className="font-bold text-sky-400 text-lg">Joueur 2 (Blanc)</p>
        <p className="text-slate-400 mt-1 text-sm">Mangées : <span className="text-white font-extrabold text-base">{eatenByWhite}</span></p>
      </div>
    </div>
  </div>
);
}

// =========================================================================
// FONCTIONS LOGIQUES DU JEU (Inchangées, typées pour TS)
// =========================================================================

function createInitialBoard(): number[][] {
  return Array(8).fill(null).map((_, row) =>
    Array(8).fill(null).map((_, col) => {
      if ((row + col) % 2 === 0 && row < 3) return 1;
      if ((row + col) % 2 === 0 && row > 4) return 2;
      return 0;
    })
  );
}

function checkWinner(newBoard: number[][]): number {
  if (!newBoard.some(row => row.some(cell => cell === 1 || cell === 3))) return 2;
  if (!newBoard.some(row => row.some(cell => cell === 2 || cell === 4))) return 1;
  return 0;
}

function canCapture(row: number, col: number, board: number[][], turn: number): boolean {
  const directions = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
  return directions.some(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    const midRow = row + dr / 2;
    const midCol = col + dc / 2;
    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) return false;
    const isAdverse = turn === 1 ? (board[midRow][midCol] === 2 || board[midRow][midCol] === 4)
                                 : (board[midRow][midCol] === 1 || board[midRow][midCol] === 3);
    return isAdverse && board[newRow][newCol] === 0;
  });
}

function hasAnyCapture(board: number[][], turn: number): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === turn || board[row][col] === turn + 2) {
        if (canCapture(row, col, board, turn)) return true;
      }
    }
  }
  return false;
}

function isPathClear(r1: number, c1: number, r2: number, c2: number, board: number[][]): boolean {
  const dr = r2 > r1 ? 1 : -1;
  const dc = c2 > c1 ? 1 : -1;
  let r = r1 + dr;
  let c = c1 + dc;
  while (r !== r2 || c !== c2) {
    if (board[r][c] !== 0) return false;
    r += dr;
    c += dc;
  }
  return true;
}

function isValidDameCapture(r1: number, c1: number, r2: number, c2: number, board: number[][], turn: number): boolean {
  if (Math.abs(r2 - r1) !== Math.abs(c2 - c1)) return false;
  const dr = r2 > r1 ? 1 : -1;
  const dc = c2 > c1 ? 1 : -1;
  let r = r1 + dr;
  let c = c1 + dc;
  let adverseFound = false;
  while (r !== r2 || c !== c2) {
    const cell = board[r][c];
    const isAdverse = turn === 1 ? (cell === 2 || cell === 4) : (cell === 1 || cell === 3);
    if (isAdverse && !adverseFound) adverseFound = true;
    else if (cell !== 0) return false;
    r += dr;
    c += dc;
  }
  return adverseFound && board[r2][c2] === 0;
}