/**
 * Metronome controller module
 */

// Web Audio API context and buffer
const context = new (window.AudioContext || window.webkitAudioContext)();
let tickBuffer = null;
let tockBuffer = null; // Add tock buffer for up strokes
let gainNode = null; // Add gain node for volume control

// Metronome state
let currentBpm = 40;
let isSoundEnabled = false;
let metronomeVolume = 1.0; // Volume level (0.0 to 1.0)

// UI Elements
let bpmInput = null;
let bpmDisplay = null;
let decreaseButton = null;
let increaseButton = null;
let soundToggle = null;

// Hold-to-repeat state
let holdInterval = null;
let holdTimeout = null;

/**
 * Load and decode the tick sound buffer
 */
async function loadTickBuffer() {
    try {
        const response = await fetch('metronome.mp3');
        const arrayBuffer = await response.arrayBuffer();
        tickBuffer = await context.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error('Error loading tick sound:', e);
    }
}

/**
 * Load and decode the tock sound buffer
 */
async function loadTockBuffer() {
    try {
        const response = await fetch('metronome-tock.mp3');
        const arrayBuffer = await response.arrayBuffer();
        tockBuffer = await context.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error('Error loading tock sound:', e);
    }
}

/**
 * Save metronome settings to all storage types
 * @param {number} bpm - Current BPM value
 * @param {boolean} soundOn - Sound enabled state
 */
function saveMetronomeSettings(bpm, soundOn) {
    const settings = { bpm, soundOn };
    const json = JSON.stringify(settings);
    localStorage.setItem('metronomeSettings', json);
    sessionStorage.setItem('metronomeSettings', json);
    document.cookie = 'metronomeSettings=' + encodeURIComponent(json) + '; path=/; max-age=' + (60 * 60 * 24 * 7);
}

/**
 * Load metronome settings from storage
 * @returns {Object|null} Settings object or null if not found
 */
function loadMetronomeSettings() {
    let saved = sessionStorage.getItem('metronomeSettings') ||
               localStorage.getItem('metronomeSettings') ||
               (document.cookie.match(/(?:^|; )metronomeSettings=([^;]*)/) || [])[1];
    if (!saved) return null;
    try {
        return JSON.parse(decodeURIComponent(saved));
    } catch (e) {
        return null;
    }
}

/**
 * Get current BPM value
 * @returns {number} Current BPM
 */
export function getBPM() {
    return currentBpm;
}

/**
 * Set BPM value and update UI
 * @param {number} value - New BPM value
 * @param {boolean} [saveSettings=true] - Whether to save settings after update
 */
export function setBPM(value, saveSettings = true) {
    // Clamp value between 10 and 200
    currentBpm = Math.min(200, Math.max(10, value));
    
    // Update UI if initialized
    if (bpmInput) {
        bpmInput.value = currentBpm;
    }

    // Save settings if requested
    if (saveSettings) {
        saveMetronomeSettings(currentBpm, isSoundEnabled);
    }
}

/**
 * Set sound enabled state and update UI
 * @param {boolean} enabled - Whether sound should be enabled
 * @param {boolean} [saveSettings=true] - Whether to save settings after update
 */
function setSoundEnabled(enabled, saveSettings = true) {
    isSoundEnabled = enabled;
    if (soundToggle) {
        soundToggle.textContent = enabled ? 'Sound On ✔️' : 'Sound Off ✖️';
    }
    
    // Save settings if requested
    if (saveSettings) {
        saveMetronomeSettings(currentBpm, isSoundEnabled);
    }
}

/**
 * Set metronome volume level
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export function setMetronomeVolume(volume = 1.0) {
    metronomeVolume = Math.min(1.0, Math.max(0.0, volume));
    
    // Update gain node if it exists
    if (gainNode) {
        gainNode.gain.value = metronomeVolume;
    }
}

/**
 * Ensure metronome is at maximum volume - call at exercise start
 */
export function ensureMaxVolume() {
    setMetronomeVolume(1.0);
    
    // Also ensure audio context is resumed (important for mobile)
    if (context.state === 'suspended') {
        context.resume();
    }
}

/**
 * Play metronome tick if sound is enabled
 */
export function playTick() {
    if (!isSoundEnabled || !tickBuffer) return;

    // Create gain node if it doesn't exist
    if (!gainNode) {
        gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = metronomeVolume;
    }

    const source = context.createBufferSource();
    source.buffer = tickBuffer;
    source.connect(gainNode);
    source.start();
}

/**
 * Play metronome tock if sound is enabled (for up strokes)
 */
export function playTock() {
    if (!isSoundEnabled || !tockBuffer) return;

    // Create gain node if it doesn't exist
    if (!gainNode) {
        gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = metronomeVolume;
    }

    const source = context.createBufferSource();
    source.buffer = tockBuffer;
    source.connect(gainNode);
    source.start();
}

/**
 * Helper function to start hold-to-repeat functionality
 * @param {function} action - Function to execute repeatedly
 */
function startHoldToRepeat(action) {
    // Clear any existing intervals
    clearHoldToRepeat();
    
    // Execute immediately
    action();
    
    // Start with a delay, then repeat faster
    holdTimeout = setTimeout(() => {
        holdInterval = setInterval(action, 150); // Repeat every 150ms
    }, 300); // Initial delay of 300ms
}

/**
 * Helper function to stop hold-to-repeat functionality
 */
function clearHoldToRepeat() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
    if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
    }
}

/**
 * Initialize metronome UI and attach event listeners
 */
export function setupMetronomeUI() {
    // Get UI elements
    bpmInput = document.getElementById('bpmInput');
    decreaseButton = document.getElementById('decreaseBpm');
    increaseButton = document.getElementById('increaseBpm');
    soundToggle = document.getElementById('soundToggle');

    if (!bpmInput || !decreaseButton || !increaseButton || !soundToggle) {
        console.error('Required metronome UI elements not found');
        return;
    }

    // Load saved settings
    const savedSettings = loadMetronomeSettings();
    if (savedSettings) {
        // Initialize with saved values
        setBPM(savedSettings.bpm, false);
        setSoundEnabled(savedSettings.soundOn, false);
    } else {
        // Initialize with default values
        setBPM(parseInt(bpmInput.value), false);
        setSoundEnabled(false, false);
    }

    // Load tick sound buffer
    loadTickBuffer();
    
    // Load tock sound buffer
    loadTockBuffer();

    // Resume AudioContext on first interaction
    window.addEventListener('click', () => {
        if (context.state === 'suspended') {
            context.resume();
        }
    }, { once: true });

    // BPM input change handler
    bpmInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            setBPM(value, true);
        }
    });

    // BPM input validation on blur
    bpmInput.addEventListener('blur', (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 10 || value > 200) {
            // Reset to current valid value if invalid input
            setBPM(currentBpm, false);
        }
    });

    // Decrease button handlers with hold-to-repeat
    decreaseButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startHoldToRepeat(() => {
            setBPM(currentBpm - 1, true);
        });
    });

    decreaseButton.addEventListener('mouseup', clearHoldToRepeat);
    decreaseButton.addEventListener('mouseleave', clearHoldToRepeat);

    // Touch events for mobile
    decreaseButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHoldToRepeat(() => {
            setBPM(currentBpm - 1, true);
        });
    });

    decreaseButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearHoldToRepeat();
    });

    decreaseButton.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        clearHoldToRepeat();
    });

    // Increase button handlers with hold-to-repeat
    increaseButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startHoldToRepeat(() => {
            setBPM(currentBpm + 1, true);
        });
    });

    increaseButton.addEventListener('mouseup', clearHoldToRepeat);
    increaseButton.addEventListener('mouseleave', clearHoldToRepeat);

    // Touch events for mobile
    increaseButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHoldToRepeat(() => {
            setBPM(currentBpm + 1, true);
        });
    });

    increaseButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearHoldToRepeat();
    });

    increaseButton.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        clearHoldToRepeat();
    });

    // Sound toggle handler
    soundToggle.addEventListener('click', () => {
        setSoundEnabled(!isSoundEnabled, true);
        
        // Play a test tick when enabling sound
        if (isSoundEnabled) {
            playTick();
        }
    });

    // Cleanup hold-to-repeat on window blur/focus loss
    window.addEventListener('blur', clearHoldToRepeat);
    window.addEventListener('beforeunload', clearHoldToRepeat);
}

/**
 * Clean up metronome resources
 */
export function cleanup() {
    clearHoldToRepeat();
    if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
    }
    if (context) {
        context.close();
    }
    tickBuffer = null;
    tockBuffer = null;
}

// Handle page unload
if (typeof window !== 'undefined') {
    window.addEventListener('unload', cleanup);
}
