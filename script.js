// Simple 1-player chess game (player vs multi-level AI)
const PIECES = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

let board = [
    ['bR','bN','bB','bQ','bK','bB','bN','bR'],
    ['bP','bP','bP','bP','bP','bP','bP','bP'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['wP','wP','wP','wP','wP','wP','wP','wP'],
    ['wR','wN','wB','wQ','wK','wB','wN','wR']
];

let selected = null;
let turn = 'w'; // 'w' = white (player), 'b' = black (AI)
let statusDiv = document.getElementById('status');
let aiLevel = 'easy';

// Menu logic
const menu = document.getElementById('menu-overlay');
document.querySelectorAll('.bot-btn').forEach(btn => {
    btn.onclick = () => {
        aiLevel = btn.getAttribute('data-diff');
        menu.style.display = 'none';
        renderBoard();
    };
});

function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'white' : 'black');
            if (selected && selected[0] === r && selected[1] === c) cell.classList.add('selected');
            cell.onclick = () => handleCellClick(r, c);
            const piece = board[r][c];
            if (piece) cell.textContent = PIECES[piece];
            chessboard.appendChild(cell);
        }
    }
}

function handleCellClick(r, c) {
    if (turn !== 'w' || menu.style.display !== 'none') return;
    const piece = board[r][c];
    if (selected) {
        if (isValidMove(selected[0], selected[1], r, c, 'w')) {
            movePiece(selected[0], selected[1], r, c);
            selected = null;
            turn = 'b';
            statusDiv.textContent = "AI's move (Black)";
            setTimeout(aiMove, 500);
        } else if (piece && piece[0] === 'w') {
            selected = [r, c];
        } else {
            selected = null;
        }
    } else if (piece && piece[0] === 'w') {
        selected = [r, c];
    }
    renderBoard();
}

function movePiece(fromR, fromC, toR, toC) {
    board[toR][toC] = board[fromR][fromC];
    board[fromR][fromC] = null;
}

function isValidMove(fromR, fromC, toR, toC, color) {
    // Basic move validation (no check/checkmate, just legal moves)
    const piece = board[fromR][fromC];
    if (!piece || piece[0] !== color) return false;
    const target = board[toR][toC];
    if (target && target[0] === color) return false;
    const dr = toR - fromR, dc = toC - fromC;
    switch (piece[1]) {
        case 'P': // Pawn
            let dir = color === 'w' ? -1 : 1;
            if (dc === 0 && !target) {
                if (dr === dir) return true;
                if ((fromR === 6 && color === 'w' || fromR === 1 && color === 'b') && dr === 2 * dir && !board[fromR + dir][fromC]) return true;
            } else if (Math.abs(dc) === 1 && dr === dir && target && target[0] !== color) {
                return true;
            }
            break;
        case 'N': // Knight
            if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true;
            break;
        case 'B': // Bishop
            if (Math.abs(dr) === Math.abs(dc) && isPathClear(fromR, fromC, toR, toC)) return true;
            break;
        case 'R': // Rook
            if ((dr === 0 || dc === 0) && isPathClear(fromR, fromC, toR, toC)) return true;
            break;
        case 'Q': // Queen
            if ((Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0) && isPathClear(fromR, fromC, toR, toC)) return true;
            break;
        case 'K': // King
            if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
            break;
    }
    return false;
}

function isPathClear(fromR, fromC, toR, toC) {
    let dr = Math.sign(toR - fromR), dc = Math.sign(toC - fromC);
    let r = fromR + dr, c = fromC + dc;
    while (r !== toR || c !== toC) {
        if (board[r][c]) return false;
        r += dr; c += dc;
    }
    return true;
}


function aiMove() {
    let moves = getAllLegalMoves('b');
    if (moves.length === 0) {
        statusDiv.textContent = "You win! (AI has no moves)";
        return;
    }
    let move;
    if (aiLevel === 'easy') {
        // Random move
        move = moves[Math.floor(Math.random() * moves.length)];
    } else if (aiLevel === 'medium') {
        // Prefer captures
        let captures = moves.filter(m => board[m.toR][m.toC]);
        move = captures.length ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
    } else if (aiLevel === 'hard') {
        // Basic material evaluation, 1-ply
        let bestScore = -Infinity;
        let bestMoves = [];
        for (let m of moves) {
            let backup = board[m.toR][m.toC];
            movePiece(m.fromR, m.fromC, m.toR, m.toC);
            let score = evaluateBoard();
            board[m.fromR][m.fromC] = board[m.toR][m.toC];
            board[m.toR][m.toC] = backup;
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [m];
            } else if (score === bestScore) {
                bestMoves.push(m);
            }
        }
        move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else if (aiLevel === 'impossible') {
        // Minimax 2-ply (AI and player reply)
        let bestScore = -Infinity;
        let bestMoves = [];
        for (let m of moves) {
            let backup = board[m.toR][m.toC];
            movePiece(m.fromR, m.fromC, m.toR, m.toC);
            let replyMoves = getAllLegalMoves('w');
            let worst = Infinity;
            for (let rm of replyMoves) {
                let b2 = board[rm.toR][rm.toC];
                movePiece(rm.fromR, rm.fromC, rm.toR, rm.toC);
                let score = evaluateBoard();
                board[rm.fromR][rm.fromC] = board[rm.toR][rm.toC];
                board[rm.toR][rm.toC] = b2;
                if (score < worst) worst = score;
            }
            if (replyMoves.length === 0) worst = evaluateBoard();
            board[m.fromR][m.fromC] = board[m.toR][m.toC];
            board[m.toR][m.toC] = backup;
            if (worst > bestScore) {
                bestScore = worst;
                bestMoves = [m];
            } else if (worst === bestScore) {
                bestMoves.push(m);
            }
        }
        move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    movePiece(move.fromR, move.fromC, move.toR, move.toC);
    turn = 'w';
    statusDiv.textContent = "Your move (White)";
    renderBoard();
}

function getAllLegalMoves(color) {
    let moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece[0] === color) {
                for (let dr = -7; dr <= 7; dr++) {
                    for (let dc = -7; dc <= 7; dc++) {
                        let toR = r + dr, toC = c + dc;
                        if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && (dr !== 0 || dc !== 0) && isValidMove(r, c, toR, toC, color)) {
                            moves.push({fromR: r, fromC: c, toR, toC});
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function evaluateBoard() {
    // Simple material count
    const values = {K: 0, Q: 9, R: 5, B: 3, N: 3, P: 1};
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                let val = values[piece[1]];
                if (piece[0] === 'b') score += val;
                else score -= val;
            }
        }
    }
    return score;
}

renderBoard();
