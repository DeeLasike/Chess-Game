import { CUSTOM_MUSIC_PATH } from './constants.js';

export function createAudioController() {
    const state = {
        enabled: true,
        context: null,
        musicElement: null
    };

    function isEnabled() {
        return state.enabled;
    }

    function toggleEnabled() {
        state.enabled = !state.enabled;
        if (!state.enabled) {
            stopBackgroundMusic();
            suspend();
        }
        return state.enabled;
    }

    function prime() {
        if (!state.enabled) {
            return null;
        }

        if (!state.context) {
            state.context = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (state.context.state === 'suspended') {
            state.context.resume();
        }

        return state.context;
    }

    function suspend() {
        if (state.musicElement) {
            state.musicElement.pause();
        }

        if (state.context && state.context.state === 'running') {
            state.context.suspend();
        }
    }

    function startBackgroundMusic() {
        if (!state.enabled) {
            return;
        }

        if (!state.musicElement) {
            state.musicElement = new Audio(encodeURI(CUSTOM_MUSIC_PATH));
            state.musicElement.loop = true;
            state.musicElement.preload = 'auto';
            state.musicElement.volume = 1;
        }

        const playPromise = state.musicElement.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    }

    function stopBackgroundMusic() {
        if (state.musicElement) {
            state.musicElement.pause();
        }
    }

    function playMoveSound() {
        playSoundEffect('move');
    }

    function playSoundEffect(type) {
        const context = prime();
        if (!context) {
            return;
        }

        const now = context.currentTime;

        if (type === 'move') {
            playWoodTap(now);
            return;
        }

        if (type === 'capture') {
            playSynthNote(57, 0.12, 'square', 0.032, now, 0.002, 0.05);
            playSynthNote(50, 0.18, 'triangle', 0.026, now + 0.05, 0.002, 0.08);
            return;
        }

        if (type === 'check') {
            playSynthNote(82, 0.12, 'sawtooth', 0.03, now, 0.002, 0.06);
            playSynthNote(89, 0.16, 'sawtooth', 0.025, now + 0.07, 0.002, 0.08);
            return;
        }

        if (type === 'win') {
            playSynthNote(72, 0.22, 'triangle', 0.03, now, 0.005, 0.12);
            playSynthNote(79, 0.26, 'triangle', 0.028, now + 0.16, 0.005, 0.14);
            playSynthNote(84, 0.34, 'triangle', 0.03, now + 0.34, 0.005, 0.18);
            return;
        }

        if (type === 'lose') {
            playSynthNote(64, 0.2, 'sine', 0.03, now, 0.005, 0.12);
            playSynthNote(59, 0.24, 'sine', 0.026, now + 0.16, 0.005, 0.14);
            playSynthNote(52, 0.34, 'sine', 0.03, now + 0.34, 0.005, 0.18);
            return;
        }

        if (type === 'draw') {
            playSynthNote(67, 0.18, 'triangle', 0.026, now, 0.005, 0.1);
            playSynthNote(62, 0.24, 'triangle', 0.022, now + 0.16, 0.005, 0.12);
            return;
        }

        if (type === 'restart') {
            playSynthNote(74, 0.08, 'sine', 0.02, now, 0.003, 0.05);
            playSynthNote(79, 0.12, 'sine', 0.018, now + 0.06, 0.003, 0.06);
        }
    }

    function playSynthNote(midiNote, duration, waveType, volume, startTime, attack, release) {
        if (!state.context) {
            return;
        }

        const oscillator = state.context.createOscillator();
        const gainNode = state.context.createGain();
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        const endTime = startTime + duration;

        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(volume, startTime + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime + release);

        oscillator.connect(gainNode);
        gainNode.connect(state.context.destination);
        oscillator.start(startTime);
        oscillator.stop(endTime + release + 0.02);
    }

    function playWoodTap(startTime) {
        if (!state.context) {
            return;
        }

        playSynthNote(34, 0.07, 'triangle', 0.085, startTime, 0.001, 0.065);
        playSynthNote(41, 0.05, 'triangle', 0.04, startTime + 0.01, 0.001, 0.04);
        playSynthNote(50, 0.035, 'sine', 0.018, startTime + 0.012, 0.001, 0.025);
        playFilteredNoiseBurst(startTime + 0.004, 0.03, 1200, 0.024);
    }

    function playFilteredNoiseBurst(startTime, duration, cutoff, volume) {
        if (!state.context) {
            return;
        }

        const sampleRate = state.context.sampleRate;
        const frameCount = Math.max(1, Math.floor(sampleRate * duration));
        const buffer = state.context.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);

        for (let index = 0; index < frameCount; index += 1) {
            const decay = 1 - index / frameCount;
            data[index] = (Math.random() * 2 - 1) * decay;
        }

        const source = state.context.createBufferSource();
        const filter = state.context.createBiquadFilter();
        const gainNode = state.context.createGain();

        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, startTime);
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(state.context.destination);
        source.start(startTime);
        source.stop(startTime + duration + 0.01);
    }

    return {
        isEnabled,
        toggleEnabled,
        prime,
        suspend,
        startBackgroundMusic,
        stopBackgroundMusic,
        playMoveSound,
        playSoundEffect
    };
}
