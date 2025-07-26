/**
 * Chord From-To exercise module
 */

// Animation state
let animationFrameId = null;

/**
 * Generate alternating chord list
 * @param {string} fromChord - The base chord to alternate with
 * @param {string[]} toChords - The chords to alternate between
 * @returns {string[]} Alternating chord list
 */
function generateChordList(fromChord, toChords) {
    const list = [];
    toChords.forEach(chord => {
        list.push(fromChord, chord);
    });
    return list;
}

/**
 * Create a wrapper div with theme-aware background styling for chord images
 * @returns {HTMLDivElement} The styled wrapper element
 */
function createChordWrapper() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chord-image-wrapper';
    wrapper.style.padding = '12px';
    wrapper.style.borderRadius = '12px';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.height = '100%';
    wrapper.style.backdropFilter = 'blur(3px)';
    wrapper.style.WebkitBackdropFilter = 'blur(3px)'; // Safari support
    
    // Set theme-specific background
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
        wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
        wrapper.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.12)';
    } else {
        wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
    }
    
    return wrapper;
}

/**
 * Create an image element for a chord
 * @param {string} chord - The chord name (e.g., "Am")
 * @returns {HTMLDivElement} The wrapper containing the image
 */
function createChordImage(chord) {
    const wrapper = createChordWrapper();
    
    const img = document.createElement('img');
    img.src = `chords/${chord}.png`;
    img.alt = chord;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    wrapper.appendChild(img);
    return wrapper;
}

/**
 * Execute the chord progression exercise
 * @param {Object} exercise - Exercise configuration
 * @param {string} containerId - ID of the container element
 * @param {Object} helpers - Helper functions and state
 * @param {Function} helpers.metronomeTick - Function to play metronome tick
 * @param {Function} helpers.getBPM - Function to get current BPM
 * @param {Object} helpers.timer - Timer controller
 * @param {Function} helpers.isPaused - Function to check if exercise is paused
 */
export async function execute(exercise, containerId, helpers) {
    // Get container and ensure it exists
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    // Clear container and set up layout
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.gap = '20px';
    container.style.height = '100%';

    // Create left and right image containers
    const leftContainer = document.createElement('div');
    const rightContainer = document.createElement('div');
    [leftContainer, rightContainer].forEach(div => {
        div.style.flex = '1';
        div.style.display = 'flex';
        div.style.justifyContent = 'center';
        div.style.alignItems = 'center';
        div.style.height = '100%';
        div.style.position = 'relative';
        div.style.overflow = 'hidden';
    });
    container.appendChild(leftContainer);
    container.appendChild(rightContainer);

    // Generate chord list
    const chordsList = generateChordList(exercise.chordFrom, exercise.chordsTo);
    if (chordsList.length === 0) return;

    // Initialize state
    let currentIndex = 0;
    let previousTick = Date.now();

    // Set up initial chord display
    function updateDisplay(newChordIndex, animate = false) {
        // Get current and next chords
        const currentChord = chordsList[newChordIndex];
        const nextChordIndex = (newChordIndex + 1) % chordsList.length;
        const nextChord = chordsList[nextChordIndex];

        // Create new images
        const leftImage = createChordImage(currentChord);
        const rightImage = createChordImage(nextChord);

        // Set up transition for smooth animation
        if (animate) {
            leftContainer.style.transition = 'transform 0.2s ease-out';
            rightContainer.style.transition = 'transform 0.2s ease-out';
            leftContainer.style.transform = 'translateX(-100%)';
            rightContainer.style.transform = 'translateX(-100%)';

            // After animation, reset positions and update images
            setTimeout(() => {
                leftContainer.style.transition = 'none';
                rightContainer.style.transition = 'none';
                leftContainer.style.transform = '';
                rightContainer.style.transform = '';
                leftContainer.innerHTML = '';
                rightContainer.innerHTML = '';
                leftContainer.appendChild(leftImage);
                rightContainer.appendChild(rightImage);
            }, 200);
        } else {
            // Initial setup without animation
            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';
            leftContainer.appendChild(leftImage);
            rightContainer.appendChild(rightImage);
        }
    }

    // Set up initial display
    updateDisplay(currentIndex);

    /**
     * Start animation loop
     */
    function startAnimation() {
        function loop() {
            if (helpers.isPaused()) {
                animationFrameId = requestAnimationFrame(loop); // Keep checking while paused
                return;
            }

            const now = Date.now();
            const bpm = helpers.getBPM?.() || 40;
            const interval = 60000 / bpm;

            if (now - previousTick >= interval) {
                helpers.metronomeTick();
                currentIndex = (currentIndex + 1) % chordsList.length;
                updateDisplay(currentIndex, true);
                previousTick = now;
            }

            if (helpers.timer.getRemaining() > 0) {
                animationFrameId = requestAnimationFrame(loop);
            } else {
                stopAnimation();
            }
        }

        animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Stop animation loop
     */
    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Update theme-specific styles for chord wrappers
     */
    function updateChordWrapperStyles() {
        const wrappers = container.querySelectorAll('.chord-image-wrapper');
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        wrappers.forEach(wrapper => {
            if (isDarkMode) {
                wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                wrapper.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.12)';
            } else {
                wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
                wrapper.style.boxShadow = 'none';
            }
        });
    }

    /**
     * Clean up resources
     */
    function cleanup() {
        stopAnimation();
        container.innerHTML = '';
        window.removeEventListener('unload', cleanup);
    }

    // Listen for theme changes to update wrapper styles
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                updateChordWrapperStyles();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // Start the animation
    startAnimation();

    // Clean up on window unload
    window.addEventListener('unload', () => {
        observer.disconnect();
        cleanup();
    });

    // Return cleanup function
    return cleanup;
}
