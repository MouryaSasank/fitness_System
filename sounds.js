// ─────────────────────────────────────────────
// sounds.js — Sound Effects Manager (Optional)
// ─────────────────────────────────────────────

const SoundManager = {
    enabled: localStorage.getItem('soundEnabled') === 'true',

    // Simple beep sounds using Web Audio API
    context: null,

    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    questComplete() {
        this.init();
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.15), 100); // E5
    },

    levelUp() {
        this.init();
        this.playTone(523.25, 0.1);
        setTimeout(() => this.playTone(659.25, 0.1), 100);
        setTimeout(() => this.playTone(783.99, 0.2), 200);
    },

    achievement() {
        this.init();
        this.playTone(783.99, 0.15);
        setTimeout(() => this.playTone(1046.50, 0.2), 150);
    },

    click() {
        this.init();
        this.playTone(800, 0.05);
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        if (this.enabled) this.click();
        return this.enabled;
    }
};

// Auto-initialize on first interaction
document.addEventListener('click', () => SoundManager.init(), { once: true });
