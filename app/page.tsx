'use client'

import { useState, useEffect } from 'react';

export default function Home() {
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
    <div className="flex flex-col justify-center items-center mt-10">
      {winner !== 0 && <p className="text-2xl font-bold text-yellow-400 mb-4">Joueur {winner} a gagné !</p>}
      {winner !== 0 && <button onClick={resetGame} className="mt-4 px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300">Rejouer</button>}
      {winner === 0 && <p className="text-lg font-semibold text-white mb-4">Tour du joueur {turn}</p>}
      {winner === 0 && <p className="text-lg font-semibold text-white mb-4">Temps : {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p>}
      <div className="flex items-center gap-8">
        <div className="text-white text-center">
          <p className="font-bold">Joueur 1 (Noir)</p>
          <p>Pièces mangées : {eatenByBlack}</p>
        </div>
        <div id="board">
          {board.map((rowData, rowIndex) => (
            <div key={rowIndex} className="row">
              {rowData.map((colData, colIndex) => {
                const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
                const cellClass = `${(rowIndex + colIndex) % 2 === 0 ? "cell dark" : "cell light"} ${isSelected ? "selected" : ""}`;
                return (
                  <div key={colIndex} className={cellClass} onClick={() => handleClick(rowIndex, colIndex)}>
                    {board[rowIndex][colIndex] === 1 && <div className="piece black"></div>}
                    {board[rowIndex][colIndex] === 2 && <div className="piece white"></div>}
                    {board[rowIndex][colIndex] === 3 && <div className="piece black dame"></div>}
                    {board[rowIndex][colIndex] === 4 && <div className="piece white dame"></div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-white text-center">
          <p className="font-bold">Joueur 2 (Blanc)</p>
          <p>Pièces mangées : {eatenByWhite}</p>
        </div>
      </div>
    </div>
  );
}

function createInitialBoard() {
  return Array(8).fill(null).map((_, row) =>
    Array(8).fill(null).map((_, col) => {
      if ((row + col) % 2 === 0 && row < 3) return 1;
      if ((row + col) % 2 === 0 && row > 4) return 2;
      return 0;
    })
  );
}

function checkWinner(newBoard) {
  if (!newBoard.some(row => row.some(cell => cell === 1 || cell === 3)))
    return (2);
  if (!newBoard.some(row => row.some(cell => cell === 2 || cell === 4)))
    return (1);
  return (0);
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