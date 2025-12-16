/* ========================================
   CHESS CLOCK - APPLICATION LOGIC
   High-precision timing with requestAnimationFrame
   ======================================== */

// ========================================
// CONFIGURATION & PRESETS
// ========================================

const PRESETS = {
    bullet: { name: 'Bullet', time: 60, increment: 0, icon: '⚡' },
    blitz: { name: 'Blitz', time: 300, increment: 3, icon: '🔥' },
    rapid: { name: 'Rapid', time: 900, increment: 10, icon: '⏱️' },
    classical: { name: 'Classical', time: 1800, increment: 30, icon: '🏛️' },
    custom: { name: 'Custom', time: 300, increment: 0, icon: '✏️' }
};

const INCREMENT_TYPES = {
    FISCHER: 'fischer',
    BRONSTEIN: 'bronstein',
    NONE: 'none'
};

// ========================================
// GAME STATE
// ========================================

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.status = 'idle'; // idle, running, paused, finished
        this.activePlayer = null; // 1 or 2
        this.currentPreset = 'blitz';
        this.incrementType = INCREMENT_TYPES.FISCHER;
        
        this.player1 = {
            timeRemaining: PRESETS.blitz.time * 1000, // ms
            moves: 0,
            isActive: false
        };
        
        this.player2 = {
            timeRemaining: PRESETS.blitz.time * 1000, // ms
            moves: 0,
            isActive: false
        };
        
        this.settings = {
            minutes: 5,
            seconds: 0,
            increment: 3,
            soundEnabled: true
        };
    }

    getPlayer(num) {
        return num === 1 ? this.player1 : this.player2;
    }

    getOpponent(num) {
        return num === 1 ? this.player2 : this.player1;
    }
}

// ========================================
// TIMER ENGINE
// ========================================

class TimerEngine {
    constructor(gameState, onTick, onTimeout) {
        this.gameState = gameState;
        this.onTick = onTick;
        this.onTimeout = onTimeout;
        this.lastTimestamp = null;
        this.animationFrameId = null;
        this.bronsteinDelayRemaining = 0;
    }

    start(playerNum) {
        if (this.gameState.status === 'finished') return;
        
        this.gameState.status = 'running';
        this.gameState.activePlayer = playerNum;
        
        // Reset player states
        this.gameState.player1.isActive = playerNum === 1;
        this.gameState.player2.isActive = playerNum === 2;
        
        // Initialize Bronstein delay
        if (this.gameState.incrementType === INCREMENT_TYPES.BRONSTEIN) {
            const preset = PRESETS[this.gameState.currentPreset];
            this.bronsteinDelayRemaining = preset.increment * 1000;
        }
        
        this.lastTimestamp = performance.now();
        this.tick();
    }

    tick() {
        if (this.gameState.status !== 'running') return;
        
        const now = performance.now();
        const delta = now - this.lastTimestamp;
        this.lastTimestamp = now;
        
        const activePlayer = this.gameState.getPlayer(this.gameState.activePlayer);
        
        // Handle Bronstein delay
        if (this.gameState.incrementType === INCREMENT_TYPES.BRONSTEIN && 
            this.bronsteinDelayRemaining > 0) {
            this.bronsteinDelayRemaining -= delta;
            if (this.bronsteinDelayRemaining < 0) {
                // Delay exceeded, subtract overflow from time
                activePlayer.timeRemaining += this.bronsteinDelayRemaining;
                this.bronsteinDelayRemaining = 0;
            }
        } else {
            // Normal countdown
            activePlayer.timeRemaining -= delta;
        }
        
        // Check for timeout
        if (activePlayer.timeRemaining <= 0) {
            activePlayer.timeRemaining = 0;
            this.gameState.status = 'finished';
            this.onTimeout(this.gameState.activePlayer);
            return;
        }
        
        this.onTick();
        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    pause() {
        if (this.gameState.status !== 'running') return;
        
        this.gameState.status = 'paused';
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resume() {
        if (this.gameState.status !== 'paused') return;
        
        this.gameState.status = 'running';
        this.lastTimestamp = performance.now();
        this.tick();
    }

    switchPlayer() {
        if (this.gameState.status === 'finished') return;
        if (this.gameState.status === 'idle') {
            // First move - start player 1's clock
            this.start(1);
            return;
        }
        
        // Pause current animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        const currentPlayer = this.gameState.activePlayer;
        const activePlayerState = this.gameState.getPlayer(currentPlayer);
        const preset = PRESETS[this.gameState.currentPreset];
        
        // Increment moves
        activePlayerState.moves++;
        
        // Apply Fischer increment (time added after move)
        if (this.gameState.incrementType === INCREMENT_TYPES.FISCHER && preset.increment > 0) {
            activePlayerState.timeRemaining += preset.increment * 1000;
        }
        
        // Switch to other player
        const newPlayer = currentPlayer === 1 ? 2 : 1;
        this.start(newPlayer);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// ========================================
// SOUND MANAGER
// ========================================

class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playClick() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(800, 0.05, 'square');
    }

    playSwitch() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(600, 0.1, 'sine');
    }

    playWarning() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(440, 0.2, 'sawtooth');
    }

    playTimeout() {
        if (!this.enabled || !this.audioContext) return;
        // Play descending notes
        this.playTone(523, 0.15, 'square');
        setTimeout(() => this.playTone(392, 0.15, 'square'), 150);
        setTimeout(() => this.playTone(262, 0.3, 'square'), 300);
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    vibrate(pattern = [50]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

// ========================================
// UI CONTROLLER
// ========================================

class UIController {
    constructor(gameState, timerEngine, soundManager) {
        this.gameState = gameState;
        this.timerEngine = timerEngine;
        this.soundManager = soundManager;
        this.lastClickTime = 0;
        this.debounceMs = 200;
        
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateUI();
    }

    cacheElements() {
        // Player panels
        this.player1Panel = document.getElementById('player1Panel');
        this.player2Panel = document.getElementById('player2Panel');
        
        // Timer displays
        this.timer1 = document.getElementById('timer1');
        this.timer2 = document.getElementById('timer2');
        
        // Move counters
        this.moves1 = document.getElementById('moves1');
        this.moves2 = document.getElementById('moves2');
        
        // Increment badges
        this.increment1 = document.getElementById('increment1');
        this.increment2 = document.getElementById('increment2');
        
        // Controls
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Status
        this.gameStatus = document.getElementById('gameStatus');
        this.statusText = this.gameStatus.querySelector('.status-text');
        
        // Timeout overlay
        this.timeoutOverlay = document.getElementById('timeoutOverlay');
        this.timeoutWinner = document.getElementById('timeoutWinner');
        this.newGameBtn = document.getElementById('newGameBtn');
        
        // Settings modal
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.cancelSettingsBtn = document.getElementById('cancelSettings');
        this.applySettingsBtn = document.getElementById('applySettings');
        
        // Settings inputs
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.incrementInput = document.getElementById('increment');
        this.soundToggle = document.getElementById('soundToggle');
        this.incrementGroup = document.getElementById('incrementGroup');
        
        // Preset buttons
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Increment type buttons
        this.incrementTypeBtns = document.querySelectorAll('.increment-type-btn');
    }

    bindEvents() {
        // Player panel clicks
        this.player1Panel.addEventListener('click', () => this.handlePlayerClick(1));
        this.player2Panel.addEventListener('click', () => this.handlePlayerClick(2));
        
        // Touch support for mobile
        this.player1Panel.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePlayerClick(1);
        });
        this.player2Panel.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePlayerClick(2);
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Control buttons
        this.pauseBtn.addEventListener('click', () => this.handlePauseClick());
        this.resetBtn.addEventListener('click', () => this.handleReset());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.newGameBtn.addEventListener('click', () => this.handleNewGame());
        
        // Preset buttons
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.selectPreset(preset);
            });
        });
        
        // Increment type buttons
        this.incrementTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectIncrementType(btn.dataset.type);
            });
        });
        
        // Settings modal
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.applySettingsBtn.addEventListener('click', () => this.applySettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
        });
    }

    handlePlayerClick(playerNum) {
        // Debounce to prevent double clicks
        const now = Date.now();
        if (now - this.lastClickTime < this.debounceMs) return;
        this.lastClickTime = now;
        
        this.soundManager.playSwitch();
        this.soundManager.vibrate([30]);
        
        if (this.gameState.status === 'idle') {
            // First click starts the game - activate player 1
            this.timerEngine.switchPlayer();
            this.pauseBtn.disabled = false;
        } else if (this.gameState.status === 'running') {
            // Only the active player can switch
            if (this.gameState.activePlayer === playerNum) {
                this.timerEngine.switchPlayer();
            }
        } else if (this.gameState.status === 'paused') {
            // Resume on click
            this.timerEngine.resume();
            this.pauseBtn.classList.remove('paused');
        }
        
        this.updateUI();
    }

    handleKeyboard(e) {
        // Space or Enter to switch/start
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (this.gameState.status === 'idle') {
                this.handlePlayerClick(1);
            } else if (this.gameState.status === 'running') {
                this.timerEngine.switchPlayer();
                this.soundManager.playSwitch();
                this.updateUI();
            } else if (this.gameState.status === 'paused') {
                this.timerEngine.resume();
                this.pauseBtn.classList.remove('paused');
            }
        }
        
        // P to pause
        if (e.code === 'KeyP') {
            this.handlePauseClick();
        }
        
        // R to reset
        if (e.code === 'KeyR') {
            this.handleReset();
        }
        
        // Escape to close modal
        if (e.code === 'Escape') {
            this.closeSettings();
            this.timeoutOverlay.classList.remove('active');
        }
    }

    handlePauseClick() {
        if (this.gameState.status === 'running') {
            this.timerEngine.pause();
            this.pauseBtn.classList.add('paused');
            this.soundManager.playClick();
        } else if (this.gameState.status === 'paused') {
            this.timerEngine.resume();
            this.pauseBtn.classList.remove('paused');
            this.soundManager.playClick();
        }
        this.updateUI();
    }

    handleReset() {
        // Save current preset and increment type before reset
        const savedPreset = this.gameState.currentPreset;
        const savedIncrementType = this.gameState.incrementType;
        const savedSettings = { ...this.gameState.settings };
        
        this.timerEngine.stop();
        this.gameState.reset();
        
        // Restore the preset and settings
        this.gameState.currentPreset = savedPreset;
        this.gameState.incrementType = savedIncrementType;
        this.gameState.settings = savedSettings;
        
        // Apply the saved preset's time
        const preset = PRESETS[savedPreset];
        const timeMs = preset.time * 1000;
        this.gameState.player1.timeRemaining = timeMs;
        this.gameState.player2.timeRemaining = timeMs;
        
        // Update preset button active state
        this.presetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === savedPreset);
        });
        
        this.pauseBtn.disabled = true;
        this.pauseBtn.classList.remove('paused');
        this.timeoutOverlay.classList.remove('active');
        this.soundManager.playClick();
        this.updateUI();
    }

    handleNewGame() {
        this.handleReset();
    }

    handleTimeout(playerNum) {
        const winner = playerNum === 1 ? 'Black' : 'White';
        this.timeoutWinner.textContent = `${winner} wins on time`;
        this.timeoutOverlay.classList.add('active');
        this.soundManager.playTimeout();
        this.soundManager.vibrate([100, 50, 100, 50, 200]);
        this.updateUI();
    }

    selectPreset(presetKey) {
        const preset = PRESETS[presetKey];
        if (!preset) return;
        
        this.gameState.currentPreset = presetKey;
        
        // Update active state
        this.presetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetKey);
        });
        
        // Reset times if game is idle
        if (this.gameState.status === 'idle') {
            const timeMs = preset.time * 1000;
            this.gameState.player1.timeRemaining = timeMs;
            this.gameState.player2.timeRemaining = timeMs;
            this.gameState.player1.moves = 0;
            this.gameState.player2.moves = 0;
            
            // Update settings
            this.gameState.settings.minutes = Math.floor(preset.time / 60);
            this.gameState.settings.seconds = preset.time % 60;
            this.gameState.settings.increment = preset.increment;
        }
        
        this.updateUI();
        this.soundManager.playClick();
    }

    selectIncrementType(type) {
        this.gameState.incrementType = type;
        
        this.incrementTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Show/hide increment input
        if (type === INCREMENT_TYPES.NONE) {
            this.incrementGroup.style.display = 'none';
        } else {
            this.incrementGroup.style.display = 'block';
        }
    }

    openSettings() {
        // Populate inputs with current settings
        this.minutesInput.value = this.gameState.settings.minutes;
        this.secondsInput.value = this.gameState.settings.seconds;
        this.incrementInput.value = this.gameState.settings.increment;
        this.soundToggle.checked = this.gameState.settings.soundEnabled;
        
        // Select current increment type
        this.selectIncrementType(this.gameState.incrementType);
        
        this.settingsModal.classList.add('active');
        this.soundManager.playClick();
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    applySettings() {
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        const increment = parseInt(this.incrementInput.value) || 0;
        
        // Update settings
        this.gameState.settings.minutes = minutes;
        this.gameState.settings.seconds = seconds;
        this.gameState.settings.increment = increment;
        this.gameState.settings.soundEnabled = this.soundToggle.checked;
        
        // Update sound manager
        this.soundManager.enabled = this.soundToggle.checked;
        
        // Update custom preset
        const totalSeconds = minutes * 60 + seconds;
        PRESETS.custom.time = totalSeconds;
        PRESETS.custom.increment = this.gameState.incrementType === INCREMENT_TYPES.NONE ? 0 : increment;
        
        // Select custom preset
        this.selectPreset('custom');
        
        // Reset game with new settings
        this.timerEngine.stop();
        this.gameState.status = 'idle';
        this.gameState.activePlayer = null;
        this.gameState.player1.timeRemaining = totalSeconds * 1000;
        this.gameState.player2.timeRemaining = totalSeconds * 1000;
        this.gameState.player1.moves = 0;
        this.gameState.player2.moves = 0;
        this.gameState.player1.isActive = false;
        this.gameState.player2.isActive = false;
        
        // Save settings
        this.saveSettings();
        
        this.pauseBtn.disabled = true;
        this.pauseBtn.classList.remove('paused');
        this.closeSettings();
        this.updateUI();
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('chessClockTheme', newTheme);
        this.soundManager.playClick();
    }

    loadSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('chessClockTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Load sound preference
        const soundEnabled = localStorage.getItem('chessClockSound');
        if (soundEnabled !== null) {
            this.gameState.settings.soundEnabled = soundEnabled === 'true';
            this.soundManager.enabled = this.gameState.settings.soundEnabled;
        }
    }

    saveSettings() {
        localStorage.setItem('chessClockSound', this.gameState.settings.soundEnabled);
    }

    formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    formatMs(ms) {
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `.${centiseconds.toString().padStart(2, '0')}`;
    }

    updateUI() {
        // Update timer displays
        const time1 = this.gameState.player1.timeRemaining;
        const time2 = this.gameState.player2.timeRemaining;
        
        this.timer1.querySelector('.time-value').textContent = this.formatTime(time1);
        this.timer2.querySelector('.time-value').textContent = this.formatTime(time2);
        
        // Show milliseconds when time is low (under 20 seconds)
        if (time1 < 20000) {
            this.timer1.querySelector('.time-ms').textContent = this.formatMs(time1);
        } else {
            this.timer1.querySelector('.time-ms').textContent = '';
        }
        
        if (time2 < 20000) {
            this.timer2.querySelector('.time-ms').textContent = this.formatMs(time2);
        } else {
            this.timer2.querySelector('.time-ms').textContent = '';
        }
        
        // Update move counters
        this.moves1.textContent = this.gameState.player1.moves;
        this.moves2.textContent = this.gameState.player2.moves;
        
        // Update increment badges
        const preset = PRESETS[this.gameState.currentPreset];
        const showIncrement = this.gameState.incrementType !== INCREMENT_TYPES.NONE && preset.increment > 0;
        
        if (showIncrement) {
            const incrementText = `+${preset.increment}s`;
            this.increment1.textContent = incrementText;
            this.increment2.textContent = incrementText;
            this.increment1.classList.remove('hidden');
            this.increment2.classList.remove('hidden');
        } else {
            this.increment1.classList.add('hidden');
            this.increment2.classList.add('hidden');
        }
        
        // Update active states
        this.player1Panel.classList.toggle('active', this.gameState.player1.isActive);
        this.player2Panel.classList.toggle('active', this.gameState.player2.isActive);
        this.player1Panel.classList.toggle('inactive', 
            this.gameState.status === 'running' && !this.gameState.player1.isActive);
        this.player2Panel.classList.toggle('inactive', 
            this.gameState.status === 'running' && !this.gameState.player2.isActive);
        
        // Update warning states
        this.player1Panel.classList.toggle('warning', time1 > 0 && time1 <= 30000 && time1 > 10000);
        this.player1Panel.classList.toggle('danger', time1 > 0 && time1 <= 10000);
        this.player2Panel.classList.toggle('warning', time2 > 0 && time2 <= 30000 && time2 > 10000);
        this.player2Panel.classList.toggle('danger', time2 > 0 && time2 <= 10000);
        
        // Update status text
        this.updateStatusText();
    }

    updateStatusText() {
        let text = '';
        
        switch (this.gameState.status) {
            case 'idle':
                text = 'Tap a timer or press Space to start';
                break;
            case 'running':
                const active = this.gameState.activePlayer === 1 ? 'White' : 'Black';
                text = `${active}'s turn`;
                break;
            case 'paused':
                text = 'Game paused - Click to resume';
                break;
            case 'finished':
                text = 'Game over';
                break;
        }
        
        this.statusText.textContent = text;
    }
}

// ========================================
// INITIALIZE APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const gameState = new GameState();
    const soundManager = new SoundManager();
    
    // Create timer engine with callbacks
    const timerEngine = new TimerEngine(
        gameState,
        () => ui.updateUI(), // onTick
        (playerNum) => ui.handleTimeout(playerNum) // onTimeout
    );
    
    // Create UI controller
    const ui = new UIController(gameState, timerEngine, soundManager);
    
    // Initialize sound on first user interaction
    document.addEventListener('click', () => {
        soundManager.init();
    }, { once: true });
    
    document.addEventListener('touchstart', () => {
        soundManager.init();
    }, { once: true });
    
    // Prevent context menu on long press (mobile)
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.player-panel')) {
            e.preventDefault();
        }
    });
    
    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState.status === 'running') {
            timerEngine.pause();
            ui.pauseBtn.classList.add('paused');
            ui.updateUI();
        }
    });
    
    console.log('♔ Chess Clock initialized');
});
