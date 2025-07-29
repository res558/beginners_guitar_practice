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
    wrapper.style.borderRadius = '12px';
    wrapper.style.display = 'inline-flex'; // Size to content, not container
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.backdropFilter = 'blur(3px)';
    wrapper.style.WebkitBackdropFilter = 'blur(3px)';
    wrapper.style.maxHeight = '100%'; // Respect container height limit
    wrapper.style.maxWidth = '100%'; // Respect container width limit

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
        wrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
    } else {
        wrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
    }

    return wrapper;
}

/**
 * Create an image element for a chord with proper load handling
 * @param {string} chord - The chord name (e.g., "Am")
 * @param {Function} onLoadCallback - Callback to execute when image loads
 * @returns {HTMLDivElement} The wrapper containing the image
 */
function createChordImage(chord, onLoadCallback) {
    const wrapper = createChordWrapper();

    const img = document.createElement('img');
    img.src = `chords/${chord}.png`;
    img.alt = chord;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.display = 'block';

    // Handle image load for positioning
    const handleImageLoad = () => {
        if (onLoadCallback && typeof onLoadCallback === 'function') {
            // Use requestAnimationFrame to ensure layout is complete
            requestAnimationFrame(() => {
                onLoadCallback(wrapper);
            });
        }
    };

    if (img.complete) {
        // Image is already loaded (cached)
        handleImageLoad();
    } else {
        // Wait for image to load
        img.onload = handleImageLoad;
        img.onerror = handleImageLoad; // Still position even if image fails
    }

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
    container.style.position = 'relative';

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

    const highlightFrame = document.createElement('div');
    highlightFrame.style.position = 'absolute';
    highlightFrame.style.display = 'none';
    highlightFrame.style.border = '6px solid #7ab7ff';
    highlightFrame.style.borderRadius = '16px';
    highlightFrame.style.pointerEvents = 'none';
    highlightFrame.style.zIndex = '100';
    highlightFrame.style.boxSizing = 'border-box';
    container.appendChild(highlightFrame);

    let currentChord = getRandomChord(exercise.chordsTo);
    let nextChord = getRandomChord(exercise.chordsTo, currentChord);
    let previousTick = Date.now();

    /**
     * Position the highlight frame around the left image wrapper
     */
    function positionHighlight() {
        const targetImage = leftContainer.querySelector('.chord-image-wrapper');
        if (targetImage) {
            const rect = targetImage.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            highlightFrame.style.width = `${rect.width}px`;
            highlightFrame.style.height = `${rect.height}px`;
            highlightFrame.style.left = `${rect.left - containerRect.left}px`;
            highlightFrame.style.top = `${rect.top - containerRect.top}px`;
            highlightFrame.style.transform = 'none';
            highlightFrame.style.display = 'block';
        }
    }

    /**
     * Handle window resize and orientation changes
     */
    function handleResize() {
        // Re-position highlight after layout changes
        setTimeout(() => {
            positionHighlight();
        }, 100);
    }

    /**
     * Handle image load and position highlight
     */
    function handleImageLoad(wrapper) {
        // Only position highlight for the left image
        if (leftContainer.contains(wrapper)) {
            positionHighlight();
        }
    }

    function updateDisplay(animate = false) {
        // Create images with load callbacks
        const leftImage = createChordImage(currentChord, handleImageLoad);
        const rightImage = createChordImage(nextChord); // No callback for right image

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
                leftContainer.appendChild(createChordImage(currentChord, handleImageLoad));
                rightContainer.appendChild(createChordImage(nextChord));
            }, 200);
        } else {
            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';
            leftContainer.appendChild(leftImage);
            rightContainer.appendChild(rightImage);
        }
    }

    // Add resize listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

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
                wrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
            } else {
                wrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
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
        
        // Remove resize listeners
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        
        container.innerHTML = '';
    });

    return () => {
        observer.disconnect();
        stopAnimation();
        
        // Remove resize listeners
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        
        container.innerHTML = '';
    };
}