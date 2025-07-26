/**
 * Metronome controller module
 */

// Web Audio API context and buffer
const context = new (window.AudioContext || window.webkitAudioContext)();
let tickBuffer = null;

// Metronome state
let currentBpm = 40;
let isSoundEnabled = false;

// UI Elements
let bpmSlider = null;
let bpmDisplay = null;
let decreaseButton = null;
let increaseButton = null;
let soundToggle = null;

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
    if (bpmSlider && bpmDisplay) {
        bpmSlider.value = currentBpm;
        bpmDisplay.textContent = `Metronome: ${currentBpm} BPM`;
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
        soundToggle.textContent = enabled ? 'On ✔️' : 'Off ✖️';
    }
    
    // Save settings if requested
    if (saveSettings) {
        saveMetronomeSettings(currentBpm, isSoundEnabled);
    }
}

/**
 * Play metronome tick if sound is enabled
 */
export function playTick() {
    if (!isSoundEnabled || !tickBuffer) return;

    const source = context.createBufferSource();
    source.buffer = tickBuffer;
    source.connect(context.destination);
    source.start();
}

/**
 * Initialize metronome UI and attach event listeners
 */
export function setupMetronomeUI() {
    // Get UI elements
    bpmSlider = document.getElementById('bpmSlider');
    bpmDisplay = document.getElementById('bpmDisplay');
    decreaseButton = document.getElementById('decreaseBpm');
    increaseButton = document.getElementById('increaseBpm');
    soundToggle = document.getElementById('soundToggle');

    if (!bpmSlider || !bpmDisplay || !decreaseButton || !increaseButton || !soundToggle) {
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
        setBPM(parseInt(bpmSlider.value), false);
        setSoundEnabled(false, false);
    }

    // Load tick sound buffer
    loadTickBuffer();

    // Resume AudioContext on first interaction
    window.addEventListener('click', () => {
        if (context.state === 'suspended') {
            context.resume();
        }
    }, { once: true });

    // Slider change handler
    bpmSlider.addEventListener('input', (e) => {
        setBPM(parseInt(e.target.value), true);
        // Play a tick on change if sound is enabled
        //playTick();
    });

    // Decrease button handler
    decreaseButton.addEventListener('click', () => {
        setBPM(currentBpm - 1, true);
        //playTick();
    });

    // Increase button handler
    increaseButton.addEventListener('click', () => {
        setBPM(currentBpm + 1, true);
        //playTick();
    });

    // Sound toggle handler
    soundToggle.addEventListener('click', () => {
        setSoundEnabled(!isSoundEnabled, true);
        
        // Play a test tick when enabling sound
        if (isSoundEnabled) {
            playTick();
        }
    });
}

/**
 * Clean up metronome resources
 */
export function cleanup() {
    if (context) {
        context.close();
    }
    tickBuffer = null;
}

// Handle page unload
if (typeof window !== 'undefined') {
    window.addEventListener('unload', cleanup);
}
