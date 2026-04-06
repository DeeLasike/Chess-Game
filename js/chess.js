import { PIECE_VALUES } from './constants.js';

export function cloneBoard(sourceBoard) {
    return sourceBoard.map((row) => row.slice());
}

export function chooseAiMove(moves, board, aiLevel) {
    if (aiLevel === 'easy') {
        return randomFrom(moves);
    }

    if (aiLevel === 'medium') {
        const captures = moves.filter((move) => Boolean(board[move.toR][move.toC]));
        return captures.length > 0 ? randomFrom(captures) : randomFrom(moves);
    }

    if (aiLevel === 'hard') {
        return chooseBestMove(moves, board, 1);
    }

    return chooseBestMove(moves, board, 2);
}

export function getAllLegalMoves(color, sourceBoard) {
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

export function getLegalMovesForPiece(row, col, color, sourceBoard) {
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

export function applyMoveToBoard(sourceBoard, move) {
    const nextBoard = cloneBoard(sourceBoard);
    nextBoard[move.fromR][move.fromC] = null;
    nextBoard[move.toR][move.toC] = move.promotion || move.piece;
    return nextBoard;
}

export function isKingInCheck(color, sourceBoard) {
    const kingPosition = findKing(color, sourceBoard);
    if (!kingPosition) {
        return true;
    }

    return isSquareAttacked(kingPosition.row, kingPosition.col, oppositeColor(color), sourceBoard);
}

function chooseBestMove(moves, board, replyDepth) {
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
