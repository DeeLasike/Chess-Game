import {
    AI_MOVE_DELAY_MS,
    MOVE_ANIMATION_MS,
    PIECES,
    PIECE_NAMES,
    STARTING_BOARD
} from './constants.js';
import { BOT_PERSONAS, DEFAULT_PERSONA } from './personas.js';
import {
    applyMoveToBoard,
    chooseAiMove,
    cloneBoard,
    getAllLegalMoves,
    getLegalMovesForPiece,
    isKingInCheck
} from './chess.js';
import { createAudioController } from './audio.js';

const state = {
    board: cloneBoard(STARTING_BOARD),
    selected: null,
    turn: 'w',
    aiLevel: 'easy',
    gameOver: false,
    currentBotName: null,
    currentBotClasses: ['bot-easy', 'tone-light', 'char-milo'],
    isAnimatingMove: false,
    history: [],
    pendingAiTimeout: null
};

const audio = createAudioController();

const refs = {
    status: document.getElementById('status'),
    menu: document.getElementById('menu-overlay'),
    gameOver: document.getElementById('gameover-title'),
    gameOverHeading: document.getElementById('gameover-heading'),
    gameOverMessage: document.getElementById('gameover-msg'),
    restartButton: document.getElementById('restart-btn'),
    chessboard: document.getElementById('chessboard'),
    undoButton: document.getElementById('undo-btn'),
    soundToggle: document.getElementById('sound-toggle'),
    botPortraitCard: document.getElementById('bot-portrait-card'),
    botPortraitShell: document.getElementById('bot-portrait-shell'),
    trashTalkName: document.getElementById('trash-talk-name'),
    trashTalkMessage: document.getElementById('trash-talk-message')
};

document.querySelectorAll('.bot-btn').forEach((button) => {
    button.onclick = () => {
        audio.prime();
        audio.startBackgroundMusic();
        state.aiLevel = button.getAttribute('data-diff');
        state.currentBotName = button.querySelector('.bot-name')?.textContent?.trim() || null;
        state.currentBotClasses = button.className.split(/\s+/).filter((className) => className && className !== 'bot-btn');
        syncBotCommentaryCard(button.querySelector('.bot-avatar'));
        resetGame(false);
        refs.menu.style.display = 'none';
    };
});

refs.restartButton.onclick = () => {
    audio.prime();
    audio.startBackgroundMusic();
    audio.playSoundEffect('restart');
    resetGame(false);
};

refs.undoButton.onclick = () => {
    undoMove();
};

refs.soundToggle.onclick = () => {
    const enabled = audio.toggleEnabled();
    updateSoundToggle(enabled);

    if (enabled) {
        audio.prime();
        audio.startBackgroundMusic();
        audio.playSoundEffect('restart');
    }
};

function resetGame(showMenu = false) {
    clearPendingAiMove();
    state.board = cloneBoard(STARTING_BOARD);
    state.selected = null;
    state.turn = 'w';
    state.gameOver = false;
    refs.gameOver.style.display = 'none';
    refs.gameOverHeading.textContent = 'Game Over';
    refs.gameOverMessage.textContent = '';
    refs.status.textContent = 'Your move (White)';

    if (showMenu) {
        refs.menu.style.display = 'flex';
        setTrashTalk('Pick a bot and it will start talking.', 'Bot Booth');
    } else {
        setTrashTalk(pickPersonaLine(getPersona().intro));
    }

    renderBoard();
    state.history = [createHistoryEntry(null)];
    updateUndoButton();
}

function renderBoard() {
    refs.chessboard.innerHTML = '';
    const legalTargets = state.selected
        ? getLegalMovesForPiece(state.selected[0], state.selected[1], 'w', state.board)
        : [];

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const cell = document.createElement('div');
            const isSelected = state.selected && state.selected[0] === row && state.selected[1] === col;
            const isLegalTarget = legalTargets.some((move) => move.toR === row && move.toC === col);
            const piece = state.board[row][col];

            cell.className = 'cell ' + ((row + col) % 2 === 0 ? 'white' : 'black');
            cell.dataset.row = String(row);
            cell.dataset.col = String(col);

            if (isSelected) {
                cell.classList.add('selected');
            }

            if (isLegalTarget) {
                cell.classList.add(piece ? 'capture-target' : 'legal-target');
            }

            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = 'piece ' + (piece[0] === 'w' ? 'piece-white' : 'piece-black');
                pieceElement.textContent = PIECES[piece];
                cell.appendChild(pieceElement);
            }

            cell.onclick = () => handleCellClick(row, col);
            refs.chessboard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (state.turn !== 'w' || refs.menu.style.display !== 'none' || state.gameOver || state.isAnimatingMove) {
        return;
    }

    audio.prime();
    audio.startBackgroundMusic();

    const piece = state.board[row][col];

    if (!state.selected) {
        if (piece && piece[0] === 'w') {
            state.selected = [row, col];
            renderBoard();
        }
        return;
    }

    if (piece && piece[0] === 'w') {
        state.selected = [row, col];
        renderBoard();
        return;
    }

    const move = getLegalMovesForPiece(state.selected[0], state.selected[1], 'w', state.board).find(
        (candidate) => candidate.toR === row && candidate.toC === col
    );

    if (!move) {
        state.selected = null;
        renderBoard();
        return;
    }

    const nextBoard = applyMoveToBoard(state.board, move);
    state.selected = null;
    animateMoveOnBoard(move, () => {
        state.board = nextBoard;
        state.turn = 'b';
        renderBoard();
        audio.playMoveSound();
        const aiInCheck = isKingInCheck('b', state.board);

        if (resolveGameState('b')) {
            recordHistory(move);
            return;
        }

        refs.status.textContent = "AI's move (Black)";
        setTrashTalk(buildPlayerMoveTrashTalk(move, aiInCheck));
        recordHistory(move);
        scheduleAiMove();
    });
}

function aiMove() {
    if (state.gameOver || state.isAnimatingMove) {
        return;
    }

    const moves = getAllLegalMoves('b', state.board);
    if (moves.length === 0) {
        resolveGameState('b');
        return;
    }

    const move = chooseAiMove(moves, state.board, state.aiLevel);
    const nextBoard = applyMoveToBoard(state.board, move);

    animateMoveOnBoard(move, () => {
        state.board = nextBoard;
        state.turn = 'w';
        renderBoard();
        audio.playMoveSound();

        const playerInCheck = isKingInCheck('w', state.board);
        const playerMoves = getAllLegalMoves('w', state.board);

        if (resolveGameState('w')) {
            recordHistory(move);
            return;
        }

        refs.status.textContent = buildTurnStatus('w');
        setTrashTalk(buildAiTrashTalk(move, playerInCheck, playerMoves.length));
        recordHistory(move);
    });
}

function undoMove() {
    if (refs.menu.style.display !== 'none' || state.isAnimatingMove || state.history.length <= 1) {
        return;
    }

    clearPendingAiMove();
    state.selected = null;
    const lastEntry = state.history[state.history.length - 1];
    const previousEntry = state.history[state.history.length - 2];

    if (!lastEntry || !previousEntry) {
        return;
    }

    if (!lastEntry.move) {
        state.history.pop();
        restoreSnapshot(previousEntry.snapshot);
        return;
    }

    const shouldUndoFullRound = state.turn === 'w' && state.history.length > 2 && Boolean(previousEntry.move);

    if (!shouldUndoFullRound) {
        animateUndoMove(lastEntry.move, () => {
            state.history.pop();
            restoreSnapshot(previousEntry.snapshot);
        });
        return;
    }

    const roundStartEntry = state.history[state.history.length - 3];

    animateUndoMove(lastEntry.move, () => {
        state.history.pop();
        restoreSnapshot(previousEntry.snapshot);
        animateUndoMove(previousEntry.move, () => {
            state.history.pop();
            restoreSnapshot(roundStartEntry.snapshot);
        });
    });
}

function resolveGameState(colorToMove) {
    const legalMoves = getAllLegalMoves(colorToMove, state.board);
    const inCheck = isKingInCheck(colorToMove, state.board);

    if (legalMoves.length === 0 && inCheck) {
        const winner = colorToMove === 'w' ? 'Black' : 'White';
        audio.playSoundEffect(winner === 'Black' ? 'win' : 'lose');
        showOverlay('CHECKMATE', winner + ' wins');
        setTrashTalk(pickPersonaLine(winner === 'Black' ? getPersona().win : getPersona().lose));
        return true;
    }

    if (legalMoves.length === 0) {
        audio.playSoundEffect('draw');
        showOverlay('STALEMATE', 'Draw');
        setTrashTalk(pickPersonaLine(getPersona().stalemate));
        return true;
    }

    refs.status.textContent = buildTurnStatus(colorToMove, inCheck);
    return false;
}

function showOverlay(title, message) {
    state.gameOver = true;
    refs.gameOverHeading.textContent = title;
    refs.gameOverMessage.textContent = message;
    refs.gameOver.style.display = 'flex';
}

function buildTurnStatus(color, inCheck = isKingInCheck(color, state.board)) {
    const side = color === 'w' ? 'Your move (White)' : "AI's move (Black)";
    return inCheck ? side + ' - Check' : side;
}

function getPersona() {
    return BOT_PERSONAS[state.currentBotName] || DEFAULT_PERSONA;
}

function setTrashTalk(message, speaker = state.currentBotName || 'Black AI') {
    refs.trashTalkName.textContent = speaker;
    refs.trashTalkMessage.textContent = message;
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

function buildPlayerMoveTrashTalk(move, aiInCheck) {
    const persona = getPersona();

    if (move.captured) {
        return fillTrashTalkTemplate(pickPersonaLine(persona.panic), move);
    }

    if (aiInCheck) {
        return fillTrashTalkTemplate(pickPersonaLine(persona.reactCheck), move);
    }

    return fillTrashTalkTemplate(pickPersonaLine(persona.react), move);
}

function fillTrashTalkTemplate(template, move) {
    return template
        .replace('{captured}', move.captured ? describePiece(move.captured) : 'piece')
        .replace('{piece}', move.piece ? describePiece(move.piece) : 'piece');
}

function pickPersonaLine(entry) {
    if (Array.isArray(entry)) {
        return entry[Math.floor(Math.random() * entry.length)];
    }

    return entry;
}

function syncBotCommentaryCard(avatarElement) {
    refs.botPortraitCard.className = state.currentBotClasses.join(' ');
    if (!avatarElement) {
        refs.botPortraitShell.innerHTML = '';
        return;
    }

    refs.botPortraitShell.innerHTML = '';
    refs.botPortraitShell.appendChild(avatarElement.cloneNode(true));
}

function describePiece(piece) {
    return PIECE_NAMES[piece[1]] || 'piece';
}

function updateSoundToggle(enabled = audio.isEnabled()) {
    refs.soundToggle.textContent = enabled ? 'Sound: On' : 'Sound: Off';
    refs.soundToggle.classList.toggle('muted', !enabled);
    refs.soundToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
}

function updateUndoButton() {
    refs.undoButton.disabled = refs.menu.style.display !== 'none' || state.history.length <= 1 || state.isAnimatingMove;
}

function createSnapshot() {
    return {
        board: cloneBoard(state.board),
        turn: state.turn,
        gameOver: state.gameOver,
        statusText: refs.status.textContent,
        trashTalkName: refs.trashTalkName.textContent,
        trashTalkMessage: refs.trashTalkMessage.textContent,
        gameOverHeading: refs.gameOverHeading.textContent,
        gameOverMessage: refs.gameOverMessage.textContent,
        gameOverDisplay: refs.gameOver.style.display
    };
}

function createHistoryEntry(move) {
    return {
        move: move ? { ...move } : null,
        snapshot: createSnapshot()
    };
}

function recordHistory(move) {
    state.history.push(createHistoryEntry(move));
    updateUndoButton();
}

function restoreSnapshot(snapshot) {
    state.board = cloneBoard(snapshot.board);
    state.selected = null;
    state.turn = snapshot.turn;
    state.gameOver = snapshot.gameOver;
    refs.status.textContent = snapshot.statusText;
    refs.trashTalkName.textContent = snapshot.trashTalkName;
    refs.trashTalkMessage.textContent = snapshot.trashTalkMessage;
    refs.gameOverHeading.textContent = snapshot.gameOverHeading;
    refs.gameOverMessage.textContent = snapshot.gameOverMessage;
    refs.gameOver.style.display = snapshot.gameOverDisplay;
    renderBoard();
    updateUndoButton();
}

function scheduleAiMove() {
    clearPendingAiMove();
    state.pendingAiTimeout = window.setTimeout(() => {
        state.pendingAiTimeout = null;
        aiMove();
    }, AI_MOVE_DELAY_MS);
}

function clearPendingAiMove() {
    if (state.pendingAiTimeout !== null) {
        window.clearTimeout(state.pendingAiTimeout);
        state.pendingAiTimeout = null;
    }
}

function animateMoveOnBoard(move, onComplete) {
    animateBoardTransition(move.fromR, move.fromC, move.toR, move.toC, onComplete);
}

function animateUndoMove(move, onComplete) {
    animateBoardTransition(move.toR, move.toC, move.fromR, move.fromC, onComplete);
}

function animateBoardTransition(fromRow, fromCol, toRow, toCol, onComplete) {
    const fromCell = getCellElement(fromRow, fromCol);
    const toCell = getCellElement(toRow, toCol);
    const pieceElement = fromCell?.querySelector('.piece');

    if (!fromCell || !toCell || !pieceElement) {
        onComplete();
        return;
    }

    state.isAnimatingMove = true;
    updateUndoButton();

    const fromRect = pieceElement.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();
    const targetLeft = toRect.left + (toRect.width - fromRect.width) / 2;
    const targetTop = toRect.top + (toRect.height - fromRect.height) / 2;
    const movingPiece = pieceElement.cloneNode(true);
    movingPiece.classList.add('moving-piece');
    movingPiece.style.left = `${fromRect.left}px`;
    movingPiece.style.top = `${fromRect.top}px`;
    movingPiece.style.width = `${fromRect.width}px`;
    movingPiece.style.height = `${fromRect.height}px`;

    pieceElement.style.opacity = '0';
    document.body.appendChild(movingPiece);

    requestAnimationFrame(() => {
        movingPiece.style.transform = `translate(${targetLeft - fromRect.left}px, ${targetTop - fromRect.top}px)`;
    });

    window.setTimeout(() => {
        movingPiece.remove();
        state.isAnimatingMove = false;
        updateUndoButton();
        onComplete();
    }, MOVE_ANIMATION_MS);
}

function getCellElement(row, col) {
    return refs.chessboard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

resetGame(true);
audio.startBackgroundMusic();
updateSoundToggle();
