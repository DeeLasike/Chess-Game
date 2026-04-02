// Simple 1-player chess game (player vs basic AI)
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
    if (turn !== 'w') return;
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
    // Very basic AI: random legal move
    let moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece[0] === 'b') {
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        let toR = r + dr, toC = c + dc;
                        if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && isValidMove(r, c, toR, toC, 'b')) {
                            moves.push({fromR: r, fromC: c, toR, toC});
                        }
                    }
                }
            }
        }
    }
    if (moves.length === 0) {
        statusDiv.textContent = "You win! (AI has no moves)";
        return;
    }
    const move = moves[Math.floor(Math.random() * moves.length)];
    movePiece(move.fromR, move.fromC, move.toR, move.toC);
    turn = 'w';
    statusDiv.textContent = "Your move (White)";
    renderBoard();
}

renderBoard();
