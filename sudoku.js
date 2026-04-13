document.addEventListener("DOMContentLoaded", () => {
    const simpleLevel = document.querySelector('.simpleSudoku');
    const normalLevel = document.querySelector('.normalSudoku');
    const hardLevel = document.querySelector('.hardSudoku');
    const boardContainer = document.querySelector('#board');

    let solutionBoard = [];
    let playerBoard = [];

    function isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    }

    function solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    async function fetchSudoku(level) {
        try {
            const res = await fetch(`https://sudokubackend-v6ga.onrender.com/api/sudoku/${level}`);
            if (!res.ok) throw new Error("Lỗi server");
            const puzzle = await res.json(); 
            solutionBoard = puzzle.map(row => [...row]);
            if (!solveSudoku(solutionBoard)) {
                return;
            }
            playerBoard = puzzle.map(row => [...row]);
            renderBoard();
        } catch (err) {
            alert("Server has already run?");
        }
    }

    function renderBoard() {
        boardContainer.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const rowEl = document.createElement("div");
            rowEl.classList.add("row");
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement("input");
                cell.classList.add("cell");
                cell.type = "text";
                cell.maxLength = "1";
                if ((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0) {
                    cell.classList.add("block-light");
                } else {
                    cell.classList.add("block-dark");
                }

                if (playerBoard[i][j] !== 0) {
                    cell.value = playerBoard[i][j];
                    cell.disabled = true;
                    cell.classList.add("fixed");
                } else {
                    cell.value = "";
                    cell.addEventListener("input", (e) => {
                        let val = e.target.value.trim();

                        if (!/^[1-9]$/.test(val)) {
                            e.target.value = "";
                            return;
                        }
                        const num = parseInt(val);
                        if (num !== solutionBoard[i][j]) {
                            e.target.value = "";
                            showError(cell);
                            return;
                        }

                        playerBoard[i][j] = num;
                        cell.style.backgroundColor = "#90EE90";
                        cell.style.color = "#000";
                        cell.style.fontWeight = "bold";
                    });
                }
                rowEl.appendChild(cell);
            }
            boardContainer.appendChild(rowEl);
        }
    }
    function showError(cell) {
        const originalColor = cell.style.backgroundColor;
        cell.style.backgroundColor = "#ff5555";
        setTimeout(() => {
            cell.style.backgroundColor = originalColor || "";
        }, 400);
    }

    simpleLevel.addEventListener("click", () => fetchSudoku("easy"));
    normalLevel.addEventListener("click", () => fetchSudoku("normal"));
    hardLevel.addEventListener("click", () => fetchSudoku("hard"));
});