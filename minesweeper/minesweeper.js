const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 12, cols: 12, mines: 30 },
    hard: { rows: 16, cols: 16, mines: 40 }
};

let gameState = {
    difficulty: 'easy',
    board: [],
    revealed: [],
    flagged: [],
    gameOver: false,
    won: false,
    flags: 0,
    startTime: null,
    elapsed: 0,
    timerInterval: null
};

function initGame() {
    const config = difficulties[gameState.difficulty];
    gameState.board = [];
    gameState.revealed = [];
    gameState.flagged = [];
    gameState.gameOver = false;
    gameState.won = false;
    gameState.flags = 0;
    gameState.elapsed = 0;

    // Initialize empty board
    for (let i = 0; i < config.rows; i++) {
        gameState.board[i] = [];
        gameState.revealed[i] = [];
        gameState.flagged[i] = [];
        for (let j = 0; j < config.cols; j++) {
            gameState.board[i][j] = 0;
            gameState.revealed[i][j] = false;
            gameState.flagged[i][j] = false;
        }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < config.mines) {
        const row = Math.floor(Math.random() * config.rows);
        const col = Math.floor(Math.random() * config.cols);
        if (gameState.board[row][col] !== 9) {
            gameState.board[row][col] = 9;
            minesPlaced++;
        }
    }

    // Calculate numbers
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            if (gameState.board[i][j] !== 9) {
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni >= 0 && ni < config.rows && nj >= 0 && nj < config.cols && gameState.board[ni][nj] === 9) {
                            count++;
                        }
                    }
                }
                gameState.board[i][j] = count;
            }
        }
    }

    updateDisplay();
    clearInterval(gameState.timerInterval);
    document.getElementById('gameStatus').textContent = '';
}

function updateDisplay() {
    const config = difficulties[gameState.difficulty];
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    for (let i = 0; i < config.rows; i++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        for (let j = 0; j < config.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;

            if (gameState.revealed[i][j]) {
                cell.classList.add('revealed');
                if (gameState.board[i][j] === 9) {
                    cell.classList.add('mine');
                } else if (gameState.board[i][j] > 0) {
                    cell.textContent = gameState.board[i][j];
                    cell.classList.add('cell-number', `num${gameState.board[i][j]}`);
                } else {
                    cell.classList.add('empty');
                }
            } else if (gameState.flagged[i][j]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            }

            cell.addEventListener('click', (e) => handleCellClick(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellRightClick(i, j);
            });

            row.appendChild(cell);
        }
        board.appendChild(row);
    }

    document.getElementById('flagCount').textContent = gameState.flags;
    document.getElementById('mineCount').textContent = difficulties[gameState.difficulty].mines;
}

function handleCellClick(row, col) {
    if (gameState.gameOver || gameState.won) return;
    if (gameState.revealed[row][col] || gameState.flagged[row][col]) return;

    if (!gameState.startTime) {
        gameState.startTime = Date.now();
        startTimer();
    }

    if (gameState.board[row][col] === 9) {
        gameState.gameOver = true;
        revealAllMines();
        document.getElementById('gameStatus').textContent = '💥 Game Over!';
        document.getElementById('gameStatus').classList.add('lost');
        clearInterval(gameState.timerInterval);
        return;
    }

    revealCell(row, col);
    checkWin();
}

function handleCellRightClick(row, col) {
    if (gameState.gameOver || gameState.won) return;
    if (gameState.revealed[row][col]) return;

    gameState.flagged[row][col] = !gameState.flagged[row][col];
    gameState.flags += gameState.flagged[row][col] ? 1 : -1;
    updateDisplay();
}

function revealCell(row, col) {
    if (gameState.revealed[row][col]) return;
    gameState.revealed[row][col] = true;

    if (gameState.board[row][col] === 0) {
        const config = difficulties[gameState.difficulty];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = row + di;
                const nj = col + dj;
                if (ni >= 0 && ni < config.rows && nj >= 0 && nj < config.cols) {
                    revealCell(ni, nj);
                }
            }
        }
    }
    updateDisplay();
}

function revealAllMines() {
    const config = difficulties[gameState.difficulty];
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            if (gameState.board[i][j] === 9) {
                gameState.revealed[i][j] = true;
            }
        }
    }
    updateDisplay();
}

function checkWin() {
    const config = difficulties[gameState.difficulty];
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            if (gameState.board[i][j] !== 9 && !gameState.revealed[i][j]) {
                return;
            }
        }
    }
    gameState.won = true;
    document.getElementById('gameStatus').textContent = '🎉 You Won!';
    document.getElementById('gameStatus').classList.add('won');
    clearInterval(gameState.timerInterval);
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('timer').textContent = gameState.elapsed;
    }, 100);
}

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        gameState.difficulty = e.target.dataset.difficulty;
        initGame();
    });
});

// New game button
document.getElementById('newGameBtn').addEventListener('click', initGame);

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load theme preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Initialize game
initGame();
