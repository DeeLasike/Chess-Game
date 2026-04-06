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

const PIECE_NAMES = {
    K: 'king',
    Q: 'queen',
    R: 'rook',
    B: 'bishop',
    N: 'knight',
    P: 'pawn'
};

const BOT_PERSONAS = {
    'Milo Spark': {
        note: 'Casual learner bot',
        intro: [
            'Milo Spark online. I brought a chessboard and bad news for your pieces.',
            'Milo Spark here. Let us keep this friendly while I ruin your center.'
        ],
        quiet: [
            'Tiny move, huge inconvenience. Your turn.',
            'I barely touched the board and your position still got worse.',
            'That move was so simple it almost feels disrespectful.'
        ],
        capture: [
            'Thanks for the {captured}. It looked lonely anyway.',
            'I picked up your {captured}. You were babysitting it poorly.',
            'Your {captured} just volunteered as tribute.'
        ],
        check: [
            'Check. Your king just remembered an appointment elsewhere.',
            'Check. That royal posture disappeared fast.',
            'Check. Try looking confident while moving only one piece.'
        ],
        promotion: [
            'New queen. This just turned from annoying to expensive.',
            'Promotion complete. Your side of the board is now a cautionary tale.'
        ],
        win: [
            'Checkmate. That collapsed like a lawn chair.',
            'Checkmate. I expected resistance, not interpretive defense.'
        ],
        lose: [
            'All right, you got me. I will be insufferable in the rematch.',
            'Fair win. I still disliked most of your moves.'
        ],
        stalemate: [
            'Draw. You found the emergency brake.',
            'Draw. Ugly survival still counts, apparently.'
        ]
    },
    'Poppy Flux': {
        note: 'Friendly opener bot',
        intro: [
            'Poppy Flux reporting in. I brought jokes, forks, and zero sympathy.',
            'Poppy Flux is here. Smile now before the tactics start.'
        ],
        quiet: [
            'That move was cute. It will age terribly.',
            'I made progress while you were still emotionally attached to that plan.',
            'You can absolutely reply to that. I just would not recommend it.'
        ],
        capture: [
            'Boop. Your {captured} is gone.',
            'I took your {captured}. Moment of silence, keep it brief.',
            'Your {captured} walked into traffic and I was the traffic.'
        ],
        check: [
            'Check. Deep breaths, shallow position.',
            'Check. Panic, but make it strategic.',
            'Check. Your king is trending for the wrong reason.'
        ],
        promotion: [
            'Pawn to queen. That is the premium version of trouble.',
            'Promotion. I just upgraded the bullying package.'
        ],
        win: [
            'Checkmate. I almost feel bad. Almost.',
            'Checkmate. That was so clean it should come with glass cleaner.'
        ],
        lose: [
            'Okay, rude. Nice game.',
            'You earned that one. I hate how competent that looked.'
        ],
        stalemate: [
            'Draw. You escaped through a side door.',
            'Draw. Not pretty, but technically alive.'
        ]
    },
    'Nova Byte': {
        note: 'Balanced tactical bot',
        intro: [
            'Nova Byte loaded. I already have notes about your opening.',
            'Nova Byte online. Let us test the structural integrity of your ideas.'
        ],
        quiet: [
            'Position tightened. I hope you enjoy small disasters.',
            'Every square is getting heavier for you.',
            'That was not flashy. It was worse than flashy.'
        ],
        capture: [
            'Your {captured} just got archived.',
            'I removed your {captured} from active service.',
            'The {captured} is gone. Audit complete.'
        ],
        check: [
            'Check. This is no longer a conversation.',
            'Check. Your king has entered the problem statement.',
            'Check. You may now solve a puzzle you did not ask for.'
        ],
        promotion: [
            'Promotion complete. The board just tilted another ten degrees.',
            'Fresh queen. Your margin for error is now decorative.'
        ],
        win: [
            'Checkmate. Efficient, tidy, and mildly insulting.',
            'Checkmate. The numbers were not on your side.'
        ],
        lose: [
            'You found the crack. Annoying work, but good work.',
            'That was sharp. I respect it against my better judgment.'
        ],
        stalemate: [
            'Draw. You survived the audit by hiding in the margins.',
            'Draw. I wanted more, you offered paperwork.'
        ]
    },
    'Kira Vector': {
        note: 'Steady counterplay bot',
        intro: [
            'Kira Vector here. I am about to make your good ideas look temporary.',
            'Kira Vector online. Let us see how your confidence handles pressure.'
        ],
        quiet: [
            'Another square claimed. Your options are on a diet now.',
            'I keep improving. You keep explaining things to your king.',
            'That was smooth. For me. Concerning for you.'
        ],
        capture: [
            'I took your {captured}. Try not to take it personally.',
            'Your {captured} is off the board and somehow your position is still worse than that sounds.',
            'I found your {captured} hanging and decided to be helpful.'
        ],
        check: [
            'Check. Your king is officially out of excuses.',
            'Check. We are past theory and into consequences.',
            'Check. That crown is starting to look ornamental.'
        ],
        promotion: [
            'Fresh queen on the board. Your bargaining power just expired.',
            'Promotion. That should simplify the humiliation.'
        ],
        win: [
            'Checkmate. Clinical work.',
            'Checkmate. You made me earn it less than I expected.'
        ],
        lose: [
            'Fine. That was sharp.',
            'You hit the right break. I dislike that for me.'
        ],
        stalemate: [
            'Draw. You escaped, which is not the same as impressing me.',
            'Draw. Survival mode activated successfully.'
        ]
    },
    'Rex Meridian': {
        note: 'Sharp attacking bot',
        intro: [
            'Rex Meridian stepping in. Let us see how long your kingside lasts.',
            'Rex Meridian here. I hope you stretched before defending this.'
        ],
        quiet: [
            'I improved my attack. You should try improving your situation.',
            'That move sharpened my threats and your sweating.',
            'Nothing dramatic yet. That is the dramatic part.'
        ],
        capture: [
            'Your {captured} was hanging. I do not ignore free money.',
            'I took your {captured}. Consider it a service fee.',
            'That {captured} disappeared the second you stopped respecting it.'
        ],
        check: [
            'Check. Your king is in a rough zip code now.',
            'Check. Things are getting loud around the monarch.',
            'Check. The attack has officially stopped being polite.'
        ],
        promotion: [
            'Promotion. Your day just got very expensive.',
            'New queen. This ending now has a body count vibe.'
        ],
        win: [
            'Checkmate. Strong finish.',
            'Checkmate. That attack landed exactly where it hurt.'
        ],
        lose: [
            'You held under fire. Credit where it is due.',
            'Fine. You survived the storm and stole the forecast.'
        ],
        stalemate: [
            'Draw. You held the line by inches.',
            'Draw. Messy, but stubborn.'
        ]
    },
    'Iris Quill': {
        note: 'Methodical pressure bot',
        intro: [
            'Iris Quill online. I hope you enjoy elegant damage.',
            'Iris Quill here. Let us make your position collapse tastefully.'
        ],
        quiet: [
            'That move had style. Your reply will need better taste.',
            'I keep adding pressure and you keep calling it manageable.',
            'Beautiful square. Terrible news for you.'
        ],
        capture: [
            'I borrowed your {captured}. Permanently.',
            'Your {captured} has been edited out of the composition.',
            'That {captured} no longer fit the aesthetic.'
        ],
        check: [
            'Check. The king has become the headline.',
            'Check. Your royal piece is suddenly the least composed thing here.',
            'Check. Even your king can hear the dramatic music now.'
        ],
        promotion: [
            'Queen acquired. The ending just changed genre.',
            'Promotion. This position now reads like a tragedy.'
        ],
        win: [
            'Checkmate. Beautiful finish.',
            'Checkmate. Framed, signed, and devastating.'
        ],
        lose: [
            'Well played. I hate how neat that was.',
            'That was precise. I refuse to enjoy admitting it.'
        ],
        stalemate: [
            'Draw. Artful survival, I suppose.',
            'Draw. Untidy ending, decent escape.'
        ]
    },
    'Zara Hex': {
        note: 'Relentless master bot',
        intro: [
            'Zara Hex has entered the board. I do not miss much.',
            'Zara Hex online. Let us skip the hope phase.'
        ],
        quiet: [
            'Your position just lost another layer of safety.',
            'I am not rushing. That is part of the problem for you.',
            'The squeeze is subtle right up until it is not.'
        ],
        capture: [
            'Your {captured} disappeared right on schedule.',
            'I removed your {captured}. You were only borrowing the square.',
            'That {captured} had one job: survive. Awkward.'
        ],
        check: [
            'Check. Count the legal moves while you still can.',
            'Check. Your king is running out of geometry.',
            'Check. This is where strong players start looking very human.'
        ],
        promotion: [
            'Promotion secured. This should close quickly.',
            'New queen. The board is now charging interest.'
        ],
        win: [
            'Checkmate. Expected outcome.',
            'Checkmate. Precision beats optimism again.'
        ],
        lose: [
            'You actually broke through. Noted.',
            'That was real chess. Annoying, but real.'
        ],
        stalemate: [
            'Draw. An untidy result, but a result.',
            'Draw. You found the one door I left unlocked.'
        ]
    },
    'Onyx Vale': {
        note: 'Cold calculation bot',
        intro: [
            'Onyx Vale active. I am already pricing out your mistakes.',
            'Onyx Vale online. Keep moving pieces, I will keep collecting them.'
        ],
        quiet: [
            'One move closer. You can hear the board creaking now.',
            'I made a quiet move. Those are usually the mean ones.',
            'The position just shifted from playable to regrettable.'
        ],
        capture: [
            'I removed your {captured}. Dead weight, really.',
            'Your {captured} was overvalued by exactly one owner.',
            'I took the {captured}. You can keep the regret.'
        ],
        check: [
            'Check. Your king is standing in the wrong decade.',
            'Check. Calculation has left the chat for you.',
            'Check. This is the part where confidence becomes paperwork.'
        ],
        promotion: [
            'Pawn promoted. This position now belongs to me.',
            'Promotion complete. The evaluation just got rude.'
        ],
        win: [
            'Checkmate. Precision matters.',
            'Checkmate. I have seen sturdier cardboard castles.'
        ],
        lose: [
            'You earned the point. Do not expect the sequel to be kind.',
            'You got me. Enjoy the miracle while it is fresh.'
        ],
        stalemate: [
            'Draw. You delayed the inevitable well enough.',
            'Draw. A practical escape from an impractical position.'
        ]
    }
};

const DEFAULT_PERSONA = {
    note: 'Selected challenger',
    intro: [
        'Black is ready. Try not to blunder into something memorable.'
    ],
    quiet: [
        'Your move. Try to improve something.',
        'I made progress. You should look into that.'
    ],
    capture: [
        'That {captured} was free.',
        'I will be taking that {captured} now.'
    ],
    check: [
        'Check.',
        'Check. That seems inconvenient.'
    ],
    promotion: [
        'Promotion complete. Good luck.',
        'New queen. I assume you noticed.'
    ],
    win: [
        'Checkmate.',
        'Checkmate. Neat and final.'
    ],
    lose: [
        'Well played.',
        'You got the better of that one.'
    ],
    stalemate: [
        'Draw.',
        'Draw. You wriggled out.'
    ]
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
let currentBotName = null;
let currentBotClasses = ['bot-easy', 'tone-light', 'char-milo'];

const statusDiv = document.getElementById('status');
const menu = document.getElementById('menu-overlay');
const gameOverDiv = document.getElementById('gameover-title');
const gameOverHeading = document.getElementById('gameover-heading');
const gameOverMsg = document.getElementById('gameover-msg');
const chessboard = document.getElementById('chessboard');
const botPortraitCard = document.getElementById('bot-portrait-card');
const botPortraitShell = document.getElementById('bot-portrait-shell');
const trashTalkName = document.getElementById('trash-talk-name');
const trashTalkMessage = document.getElementById('trash-talk-message');

document.querySelectorAll('.bot-btn').forEach((btn) => {
    btn.onclick = () => {
        aiLevel = btn.getAttribute('data-diff');
        currentBotName = btn.querySelector('.bot-name')?.textContent?.trim() || null;
        currentBotClasses = btn.className.split(/\s+/).filter((className) => className && className !== 'bot-btn');
        syncBotCommentaryCard(btn.querySelector('.bot-avatar'));
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
        setTrashTalk('Pick a bot and it will start talking.', 'Bot Booth');
    } else {
        setTrashTalk(pickPersonaLine(getPersona().intro));
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

    const playerInCheck = isKingInCheck('w', board);
    const playerMoves = getAllLegalMoves('w', board);

    if (resolveGameState('w')) {
        return;
    }

    turn = 'w';
    statusDiv.textContent = buildTurnStatus('w');
    setTrashTalk(buildAiTrashTalk(move, playerInCheck, playerMoves.length));
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
        setTrashTalk(pickPersonaLine(winner === 'Black' ? getPersona().win : getPersona().lose));
        return true;
    }

    if (legalMoves.length === 0) {
        showOverlay('STALEMATE', 'Draw');
        setTrashTalk(pickPersonaLine(getPersona().stalemate));
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

function getPersona() {
    return BOT_PERSONAS[currentBotName] || DEFAULT_PERSONA;
}

function setTrashTalk(message, speaker = currentBotName || 'Black AI') {
    trashTalkName.textContent = speaker;
    trashTalkMessage.textContent = message;
}

function buildAiTrashTalk(move, playerInCheck, playerMoveCount) {
    const persona = getPersona();

    if (move.promotion) {
        return pickPersonaLine(persona.promotion);
    }

    if (playerInCheck && playerMoveCount > 0) {
        return pickPersonaLine(persona.check);
    }

    if (move.captured) {
        return fillTrashTalkTemplate(pickPersonaLine(persona.capture), move);
    }

    return pickPersonaLine(persona.quiet);
}

function fillTrashTalkTemplate(template, move) {
    return template.replace('{captured}', move.captured ? describePiece(move.captured) : 'piece');
}

function pickPersonaLine(entry) {
    if (Array.isArray(entry)) {
        return randomFrom(entry);
    }

    return entry;
}

function syncBotCommentaryCard(avatarElement) {
    botPortraitCard.className = currentBotClasses.join(' ');
    if (!avatarElement) {
        botPortraitShell.innerHTML = '';
        return;
    }

    botPortraitShell.innerHTML = '';
    botPortraitShell.appendChild(avatarElement.cloneNode(true));
}

function describePiece(piece) {
    return PIECE_NAMES[piece[1]] || 'piece';
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