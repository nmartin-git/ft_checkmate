'use client'

import { useState } from 'react';

export default function Home() {
  const [board, setBoard] = useState<number[][]>(createInitialBoard());
  const [selected, setSelected] = useState<{row: number, col: number} | null>(null);
  const [turn, setTurn] = useState<number>(1);
  const [winner, setWinner] = useState<number>(0);

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
      const validMove = Math.abs(colIndex - selected.col) === 1 &&
                  (isDame ? Math.abs(rowIndex - selected.row) === 1
                           : (turn === 1 ? rowIndex - selected.row === 1 : rowIndex - selected.row === -1)) &&
                  board[rowIndex][colIndex] === 0;

      const midRow = (selected.row + rowIndex) / 2;
      const midCol = (selected.col + colIndex) / 2;
      const validCapture = Math.abs(colIndex - selected.col) === 2 &&
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
        newBoard[midRow][midCol] = 0;
        if (turn === 1 && rowIndex === 7) newBoard[rowIndex][colIndex] = 3;
        if (turn === 2 && rowIndex === 0) newBoard[rowIndex][colIndex] = 4;
        const w = checkWinner(newBoard);
        if (w !== 0) setWinner(w);
        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 1 ? 2 : 1);
      }
    }
  }

function resetGame() {
  setBoard(createInitialBoard());
  setSelected(null);
  setTurn(1);
  setWinner(0);
}
  return (
    <div className="flex justify-center items-center mt-10">
      {winner !== 0 && <p className="text-2xl font-bold text-yellow-400 mb-4">Joueur {winner} a gagné !</p>}
      {winner !== 0 && <button onClick={resetGame} className="mt-4 px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300">Rejouer</button>}
      {winner === 0 && <p className="text-lg font-semibold text-white mb-4">Tour du joueur {turn}</p>}
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