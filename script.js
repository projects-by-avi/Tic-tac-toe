let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = null;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const statusDisplay = document.getElementById('status');
const modeDisplay = document.getElementById('current-mode');
const gameBoard = document.querySelector('.game-board');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart-game');
const selectModeButton = document.getElementById('select-mode');

document.getElementById('human-vs-human').addEventListener('click', () => setGameMode('human'));
document.getElementById('human-vs-ai').addEventListener('click', () => setGameMode('ai'));
restartButton.addEventListener('click', resetGame);
selectModeButton.addEventListener('click', resetToModeSelection);

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

function setGameMode(mode) {
    gameMode = mode;
    modeDisplay.textContent = `Current mode: ${gameMode === 'human' ? 'Human vs Human' : 'Human vs AI'}`;
    gameBoard.style.display = 'grid';
    resetGame();
}

function handleCellClick(event) {
    if (!gameMode) {
        alert("Please select a mode to start playing!");
        return;
    }
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handlePlayerMove(clickedCell, clickedCellIndex);
    if (gameMode === 'ai' && gameActive) {
        handleAIMove();
    }
}

function handlePlayerMove(cell, index) {
    board[index] = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.textContent = currentPlayer;
    checkResult();
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameActive) {
        statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    }
}

function handleAIMove() {
    const bestMove = minimax(board, 'O').index;
    const cell = document.querySelector(`.cell[data-index='${bestMove}']`);
    handlePlayerMove(cell, bestMove);
}

function checkResult() {
    let roundWon = false;
    let winningCondition;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCondition = winningConditions[i];
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = `Player ${currentPlayer} has won!`;
        gameActive = false;
        highlightWinningCells(winningCondition);
        restartButton.style.display = 'none';
        selectModeButton.style.display = 'block';
        return;
    }

    if (!board.includes('')) {
        statusDisplay.textContent = `It's a draw!`;
        gameActive = false;
        restartButton.style.display = 'none';
        selectModeButton.style.display = 'block';
        return;
    }

    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
}

function highlightWinningCells(winningCondition) {
    winningCondition.forEach(index => {
        document.querySelector(`.cell[data-index='${index}']`).classList.add('win');
    });
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'win');
        cell.textContent = '';
    });
    restartButton.style.display = 'block';
    selectModeButton.style.display = 'none';
}

function resetToModeSelection() {
    gameMode = null;
    gameBoard.style.display = 'none';
    modeDisplay.textContent = 'Select a mode to start playing';
    resetGame();
}

function minimax(newBoard, player) {
    const availSpots = newBoard.reduce((acc, val, idx) => {
        if (val === '') acc.push(idx);
        return acc;
    }, []);

    if (checkWin(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWin(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}
