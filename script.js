const PIECES = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

const PIECE_VALUES = {
    K: 0,
    Q: 9,
    R: 5,
    B: 3,
    N: 3,
    P: 1
};

const STARTING_BOARD = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

let board = cloneBoard(STARTING_BOARD);
let selected = null;
let turn = 'w';
let aiLevel = 'easy';
let gameOver = false;

const statusDiv = document.getElementById('status');
const menu = document.getElementById('menu-overlay');
const gameOverDiv = document.getElementById('gameover-title');
const gameOverHeading = document.getElementById('gameover-heading');
const gameOverMsg = document.getElementById('gameover-msg');
const chessboard = document.getElementById('chessboard');

document.querySelectorAll('.bot-btn').forEach((btn) => {
    btn.onclick = () => {
        aiLevel = btn.getAttribute('data-diff');
        resetGame(false);
        menu.style.display = 'none';
    };
});

document.getElementById('restart-btn').onclick = () => {
    resetGame(false);
};

function cloneBoard(sourceBoard) {
    return sourceBoard.map((row) => row.slice());
}

function resetGame(showMenu = false) {
    board = cloneBoard(STARTING_BOARD);
    selected = null;
    turn = 'w';
    gameOver = false;
    gameOverDiv.style.display = 'none';
    gameOverHeading.textContent = 'Game Over';
    gameOverMsg.textContent = '';
    statusDiv.textContent = 'Your move (White)';
    if (showMenu) {
        menu.style.display = 'flex';
    }
    renderBoard();
}

function renderBoard() {
    chessboard.innerHTML = '';
    const legalTargets = selected ? getLegalMovesForPiece(selected[0], selected[1], 'w') : [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const cell = document.createElement('div');
            const isSelected = selected && selected[0] === row && selected[1] === col;
            const isLegalTarget = legalTargets.some((move) => move.toR === row && move.toC === col);
            cell.className = 'cell ' + ((row + col) % 2 === 0 ? 'white' : 'black');

            if (isSelected) {
                cell.classList.add('selected');
            }

            if (isLegalTarget) {
                cell.style.boxShadow = 'inset 0 0 0 4px rgba(33, 150, 243, 0.7)';
            }

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = 'piece ' + (piece[0] === 'w' ? 'piece-white' : 'piece-black');
                pieceElement.textContent = PIECES[piece];
                cell.appendChild(pieceElement);
            }

            cell.onclick = () => handleCellClick(row, col);
            chessboard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (turn !== 'w' || menu.style.display !== 'none' || gameOver) {
        return;
    }

    const piece = board[row][col];

    if (!selected) {
        if (piece && piece[0] === 'w') {
            selected = [row, col];
            renderBoard();
        }
        return;
    }

    if (piece && piece[0] === 'w') {
        selected = [row, col];
        renderBoard();
        return;
    }

    const move = getLegalMovesForPiece(selected[0], selected[1], 'w').find(
        (candidate) => candidate.toR === row && candidate.toC === col
    );

    if (!move) {
        selected = null;
        renderBoard();
        return;
    }

    board = applyMoveToBoard(board, move);
    selected = null;
    renderBoard();

    if (resolveGameState('b')) {
        return;
    }

    turn = 'b';
    statusDiv.textContent = "AI's move (Black)";
    setTimeout(aiMove, 250);
}

function aiMove() {
    if (gameOver) {
        return;
    }

    const moves = getAllLegalMoves('b', board);
    if (moves.length === 0) {
        resolveGameState('b');
        return;
    }

    const move = chooseAiMove(moves);
    board = applyMoveToBoard(board, move);
    renderBoard();

    if (resolveGameState('w')) {
        return;
    }

    turn = 'w';
    statusDiv.textContent = buildTurnStatus('w');
}

function chooseAiMove(moves) {
    if (aiLevel === 'easy') {
        return randomFrom(moves);
    }

    if (aiLevel === 'medium') {
        const captures = moves.filter((move) => Boolean(board[move.toR][move.toC]));
        return captures.length > 0 ? randomFrom(captures) : randomFrom(moves);
    }

    if (aiLevel === 'hard') {
        return chooseBestMove(moves, 1);
    }

    return chooseBestMove(moves, 2);
}

function chooseBestMove(moves, replyDepth) {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of moves) {
        const nextBoard = applyMoveToBoard(board, move);
        let score;

        if (replyDepth === 1) {
            score = evaluateBoard(nextBoard);
        } else {
            const replies = getAllLegalMoves('w', nextBoard);
            if (replies.length === 0) {
                score = isKingInCheck('w', nextBoard) ? Infinity : evaluateBoard(nextBoard);
            } else {
                let worstReply = Infinity;
                for (const reply of replies) {
                    const replyBoard = applyMoveToBoard(nextBoard, reply);
                    const replyScore = evaluateBoard(replyBoard);
                    if (replyScore < worstReply) {
                        worstReply = replyScore;
                    }
                }
                score = worstReply;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [move];
        } else if (score === bestScore) {
            bestMoves.push(move);
        }
    }

    return randomFrom(bestMoves);
}

function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function resolveGameState(colorToMove) {
    const legalMoves = getAllLegalMoves(colorToMove, board);
    const inCheck = isKingInCheck(colorToMove, board);

    if (legalMoves.length === 0 && inCheck) {
        const winner = colorToMove === 'w' ? 'Black' : 'White';
        showOverlay('CHECKMATE', winner + ' wins');
        return true;
    }

    if (legalMoves.length === 0) {
        showOverlay('STALEMATE', 'Draw');
        return true;
    }

    statusDiv.textContent = buildTurnStatus(colorToMove, inCheck);
    return false;
}

function showOverlay(title, message) {
    gameOver = true;
    gameOverHeading.textContent = title;
    gameOverMsg.textContent = message;
    gameOverDiv.style.display = 'flex';
}

function buildTurnStatus(color, inCheck = isKingInCheck(color, board)) {
    const side = color === 'w' ? 'Your move (White)' : "AI's move (Black)";
    return inCheck ? side + ' - Check' : side;
}

function getAllLegalMoves(color, sourceBoard) {
    const moves = [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const piece = sourceBoard[row][col];
            if (piece && piece[0] === color) {
                moves.push(...getLegalMovesForPiece(row, col, color, sourceBoard));
            }
        }
    }

    return moves;
}

function getLegalMovesForPiece(row, col, color, sourceBoard = board) {
    const piece = sourceBoard[row][col];
    if (!piece || piece[0] !== color) {
        return [];
    }

    const pseudoMoves = getPseudoMovesForPiece(row, col, sourceBoard);
    return pseudoMoves.filter((move) => {
        const nextBoard = applyMoveToBoard(sourceBoard, move);
        return !isKingInCheck(color, nextBoard);
    });
}

function getPseudoMovesForPiece(row, col, sourceBoard) {
    const piece = sourceBoard[row][col];
    if (!piece) {
        return [];
    }

    const color = piece[0];
    const type = piece[1];
    const moves = [];

    if (type === 'P') {
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const oneStepRow = row + direction;

        if (isInside(oneStepRow, col) && !sourceBoard[oneStepRow][col]) {
            moves.push(createMove(row, col, oneStepRow, col, piece));

            const twoStepRow = row + direction * 2;
            if (row === startRow && isInside(twoStepRow, col) && !sourceBoard[twoStepRow][col]) {
                moves.push(createMove(row, col, twoStepRow, col, piece));
            }
        }

        for (const offset of [-1, 1]) {
            const targetRow = row + direction;
            const targetCol = col + offset;
            if (!isInside(targetRow, targetCol)) {
                continue;
            }

            const target = sourceBoard[targetRow][targetCol];
            if (target && target[0] !== color) {
                moves.push(createMove(row, col, targetRow, targetCol, piece, target));
            }
        }
    }

    if (type === 'N') {
        const offsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (const [dRow, dCol] of offsets) {
            addStepMove(sourceBoard, moves, row, col, row + dRow, col + dCol, color, piece);
        }
    }

    if (type === 'B' || type === 'R' || type === 'Q') {
        const directions = [];

        if (type === 'B' || type === 'Q') {
            directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }

        if (type === 'R' || type === 'Q') {
            directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        for (const [dRow, dCol] of directions) {
            let nextRow = row + dRow;
            let nextCol = col + dCol;

            while (isInside(nextRow, nextCol)) {
                const target = sourceBoard[nextRow][nextCol];
                if (!target) {
                    moves.push(createMove(row, col, nextRow, nextCol, piece));
                } else {
                    if (target[0] !== color) {
                        moves.push(createMove(row, col, nextRow, nextCol, piece, target));
                    }
                    break;
                }
                nextRow += dRow;
                nextCol += dCol;
            }
        }
    }

    if (type === 'K') {
        for (let dRow = -1; dRow <= 1; dRow += 1) {
            for (let dCol = -1; dCol <= 1; dCol += 1) {
                if (dRow === 0 && dCol === 0) {
                    continue;
                }
                addStepMove(sourceBoard, moves, row, col, row + dRow, col + dCol, color, piece);
            }
        }
    }

    return moves;
}

function addStepMove(sourceBoard, moves, fromRow, fromCol, toRow, toCol, color, piece) {
    if (!isInside(toRow, toCol)) {
        return;
    }

    const target = sourceBoard[toRow][toCol];
    if (!target || target[0] !== color) {
        moves.push(createMove(fromRow, fromCol, toRow, toCol, piece, target));
    }
}

function createMove(fromR, fromC, toR, toC, piece, captured = null) {
    const promotionRow = piece[0] === 'w' ? 0 : 7;
    return {
        fromR,
        fromC,
        toR,
        toC,
        piece,
        captured,
        promotion: piece[1] === 'P' && toR === promotionRow ? piece[0] + 'Q' : null
    };
}

function applyMoveToBoard(sourceBoard, move) {
    const nextBoard = cloneBoard(sourceBoard);
    nextBoard[move.fromR][move.fromC] = null;
    nextBoard[move.toR][move.toC] = move.promotion || move.piece;
    return nextBoard;
}

function isKingInCheck(color, sourceBoard) {
    const kingPosition = findKing(color, sourceBoard);
    if (!kingPosition) {
        return true;
    }

    return isSquareAttacked(kingPosition.row, kingPosition.col, oppositeColor(color), sourceBoard);
}

function findKing(color, sourceBoard) {
    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            if (sourceBoard[row][col] === color + 'K') {
                return { row, col };
            }
        }
    }

    return null;
}

function isSquareAttacked(targetRow, targetCol, byColor, sourceBoard) {
    const pawnDirection = byColor === 'w' ? -1 : 1;
    const pawnRow = targetRow - pawnDirection;

    for (const offset of [-1, 1]) {
        const pawnCol = targetCol - offset;
        if (isInside(pawnRow, pawnCol) && sourceBoard[pawnRow][pawnCol] === byColor + 'P') {
            return true;
        }
    }

    const knightOffsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [dRow, dCol] of knightOffsets) {
        const row = targetRow + dRow;
        const col = targetCol + dCol;
        if (isInside(row, col) && sourceBoard[row][col] === byColor + 'N') {
            return true;
        }
    }

    const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dRow, dCol] of diagonalDirections) {
        if (isLineAttacked(targetRow, targetCol, dRow, dCol, byColor, sourceBoard, ['B', 'Q'])) {
            return true;
        }
    }

    const straightDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dRow, dCol] of straightDirections) {
        if (isLineAttacked(targetRow, targetCol, dRow, dCol, byColor, sourceBoard, ['R', 'Q'])) {
            return true;
        }
    }

    for (let dRow = -1; dRow <= 1; dRow += 1) {
        for (let dCol = -1; dCol <= 1; dCol += 1) {
            if (dRow === 0 && dCol === 0) {
                continue;
            }
            const row = targetRow + dRow;
            const col = targetCol + dCol;
            if (isInside(row, col) && sourceBoard[row][col] === byColor + 'K') {
                return true;
            }
        }
    }

    return false;
}

function isLineAttacked(targetRow, targetCol, dRow, dCol, byColor, sourceBoard, pieceTypes) {
    let row = targetRow + dRow;
    let col = targetCol + dCol;

    while (isInside(row, col)) {
        const piece = sourceBoard[row][col];
        if (piece) {
            return piece[0] === byColor && pieceTypes.includes(piece[1]);
        }
        row += dRow;
        col += dCol;
    }

    return false;
}

function evaluateBoard(sourceBoard) {
    let score = 0;

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const piece = sourceBoard[row][col];
            if (!piece) {
                continue;
            }

            const value = PIECE_VALUES[piece[1]];
            score += piece[0] === 'b' ? value : -value;
        }
    }

    return score;
}

function oppositeColor(color) {
    return color === 'w' ? 'b' : 'w';
}

function isInside(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

resetGame(true);