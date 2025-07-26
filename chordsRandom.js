/**
 * Random Chords exercise module
 */

// Animation state
let animationFrameId = null;

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
    wrapper.style.WebkitBackdropFilter = 'blur(3px)';

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
 * Get a random chord from the available chords
 * @param {string[]} chords - Available chords
 * @param {string} [excludeChord] - Chord to exclude from selection
 * @returns {string} Selected chord
 */
function getRandomChord(chords, excludeChord) {
    const filtered = chords.filter(c => c !== excludeChord);
    if (filtered.length === 0) return chords[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Execute the random chords exercise
 * @param {Object} exercise - Exercise configuration
 * @param {string} containerId - ID of the container element
 * @param {Object} helpers - Helper functions and state
 * @param {Function} helpers.metronomeTick - Function to play metronome tick
 * @param {Function} helpers.getBPM - Function to get current BPM
 * @param {Object} helpers.timer - Timer controller
 * @param {Function} helpers.isPaused - Function to check if exercise is paused
 */
export async function execute(exercise, containerId, helpers) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.gap = '20px';
    container.style.height = '100%';

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

    let currentChord = getRandomChord(exercise.chordsTo);
    let nextChord = getRandomChord(exercise.chordsTo, currentChord);
    let previousTick = Date.now();

    function updateDisplay(animate = false) {
        const leftImage = createChordImage(currentChord);
        const rightImage = createChordImage(nextChord);

        if (animate) {
            leftContainer.style.transition = 'transform 0.2s ease-out';
            rightContainer.style.transition = 'transform 0.2s ease-out';
            leftContainer.style.transform = 'translateX(-100%)';
            rightContainer.style.transform = 'translateX(-100%)';

            setTimeout(() => {
                currentChord = nextChord;
                nextChord = getRandomChord(exercise.chordsTo, currentChord);

                leftContainer.style.transition = 'none';
                rightContainer.style.transition = 'none';
                leftContainer.style.transform = '';
                rightContainer.style.transform = '';
                leftContainer.innerHTML = '';
                rightContainer.innerHTML = '';
                leftContainer.appendChild(createChordImage(currentChord));
                rightContainer.appendChild(createChordImage(nextChord));
            }, 200);
        } else {
            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';
            leftContainer.appendChild(leftImage);
            rightContainer.appendChild(rightImage);
        }
    }

    updateDisplay();

    function startAnimation() {
        function loop() {
            if (helpers.isPaused()) {
                animationFrameId = requestAnimationFrame(loop);
                return;
            }

            const now = Date.now();
            const bpm = helpers.getBPM?.() || 40;
            const interval = 60000 / bpm;

            if (now - previousTick >= interval) {
                helpers.metronomeTick();
                updateDisplay(true);
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

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

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

    startAnimation();

    window.addEventListener('unload', () => {
        observer.disconnect();
        stopAnimation();
        container.innerHTML = '';
    });

    return () => {
        observer.disconnect();
        stopAnimation();
        container.innerHTML = '';
    };
}
