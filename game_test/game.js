
let board = document.getElementById("board")
board.innerHTML = "";

let gameBoard = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
];

let selected = null;

function drawboard()
{

    for (let i = 0; i < 8; i++)
    {
       let row = document.createElement("div")
       row.classList.add("row");
       for (let j = 0; j < 8; j++)
       {
            let piece = document.createElement("div");
            let cell = document.createElement("div");
            cell.classList.add("cell");
            if ((i + j) % 2 == 0)
            {
                cell.classList.add("dark");
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (gameBoard[i][j] == 1) {
                    piece.classList.add("piece");
                    piece.classList.add("black");
                    cell.appendChild(piece);
                }
                else if (gameBoard[i][j] == 2) {
                    piece.classList.add("piece");
                    piece.classList.add("white");
                    cell.appendChild(piece);
                }
            }   
            else
                cell.classList.add("light");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", function()
            {
                let row = parseInt(this.dataset.row);
                let col = parseInt(this.dataset.col);  
                if (selected == null)
                {
                     if (gameBoard[row][col] != 0)
                    {
                        selected = {row: row, col: col};
                        this.classList.add("selected");
                        console.log("selected", row, col);
                    }
                }
                else
                {
                    if (gameBoard[row][col] == 0 && (row + col) % 2 == 0)
                    {
                        gameBoard[row][col] = gameBoard[selected.row][selected.col];
                        gameBoard[selected.row][selected.col] = 0;
                        selected = null;
                        board.innerHTML = "";
                        drawboard();
                    } 
                    else
                    {
                        selected = null;
                        board.innerHTML = "";
                        drawboard();
                    }
                }
            });
            row.appendChild(cell);
       }
       board.appendChild(row);
    }   
}

drawboard();

console.log(board);