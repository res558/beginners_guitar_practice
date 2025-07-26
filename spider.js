/**
 * Spider exercise module
 * Implements interactive fretboard visualization for spider exercises
 */

// Animation state
let animationFrameId = null;

// String to row mapping
const STRING_MAP = {
    'e': 0,
    'B': 1,
    'G': 2,
    'D': 3,
    'A': 4,
    'E': 5
};

/**
 * Execute the spider exercise
 * @param {Object} exercise - Exercise configuration
 * @param {string} containerId - ID of the container element
 * @param {Object} helpers - Helper functions and state
 * @param {Function} helpers.metronomeTick - Function to play metronome tick
 * @param {Function} helpers.getBPM - Function to get current BPM
 * @param {Object} helpers.timer - Timer controller
 * @param {Function} helpers.isPaused - Function to check if exercise is paused
 */
export async function execute(exercise, containerId, helpers) {
    let isCleanedUp = false;
    
    // Get container and ensure it exists
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }
    
    // Create a cleanup function that can be called multiple times safely
    function cleanup() {
        if (isCleanedUp) return;
        isCleanedUp = true;
        
        // Stop animation loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('unload', cleanup);
        
        // Remove DOM elements
        container.innerHTML = '';
    }

    // Create exercise display elements
    const titleElement = document.createElement('div');
    titleElement.style.textAlign = 'center';
    titleElement.textContent = `Spider Walk - ${exercise.name}`;
    //container.appendChild(titleElement);

    // Create fretboard container
    const fretboardContainer = document.createElement('div');
    fretboardContainer.style.position = 'relative';
    fretboardContainer.style.width = '100%';
    fretboardContainer.style.maxWidth = '800px';
    fretboardContainer.style.margin = '20px auto';
    container.appendChild(fretboardContainer);

    // Create and style fretboard background image
    const fretboardImg = document.createElement('img');
    fretboardImg.src = 'spiderbgt.png';
    fretboardImg.style.width = '100%';
    fretboardImg.style.height = 'auto';
    fretboardImg.style.display = 'block';
    fretboardContainer.appendChild(fretboardImg);

    // Create grid overlay
    const gridOverlay = document.createElement('div');
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.top = '0';
    gridOverlay.style.left = '50px'; // Leave space for string names
    gridOverlay.style.right = '0';
    gridOverlay.style.bottom = '0';
    gridOverlay.style.display = 'grid';
    gridOverlay.style.gridTemplateColumns = 'repeat(8, 1fr)';
    gridOverlay.style.gridTemplateRows = 'repeat(6, 1fr)';
    gridOverlay.style.pointerEvents = 'none';
    fretboardContainer.appendChild(gridOverlay);

    // Create grid cells
    const cells = Array(48).fill(null).map(() => {
        const cell = document.createElement('div');
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.color = 'white';
        cell.style.fontWeight = 'bold';
        cell.style.fontSize = '1.2em';
        cell.style.textShadow = '1px 1px 2px black';
        gridOverlay.appendChild(cell);
        return cell;
    });

    // Helper function to parse spider map position
    function parseSpiderPosition(position) {
        const newColumn = {};
        
        // Skip empty, blank, or invalid entries
        if (!position || position === ',' || position === '') {
            return newColumn;
        }
        
        // Try to parse the string,fret format
        const [string, fret] = position.split(',');
        
        // Only add valid string,fret pairs
        if (string && fret && string in STRING_MAP) {
            newColumn[string] = fret;
        }
        
        return newColumn;
    }

    // Initialize data window with first 8 positions
    let dataWindow = Array(8).fill(null).map((_, index) => {
        const position = exercise.spiderMap[index % exercise.spiderMap.length];
        return parseSpiderPosition(position);
    });
    let spiderMapIndex = 8 % exercise.spiderMap.length; // Start from the 9th position (or wrap)

    // Function to update data window with next position
    function updateDataWindow() {
        // Remove first column
        dataWindow.shift();
        
        // Add new column at the end
        const position = exercise.spiderMap[spiderMapIndex];
        dataWindow.push(parseSpiderPosition(position));
        
        // Update spider map index
        spiderMapIndex = (spiderMapIndex + 1) % exercise.spiderMap.length;
    }

    // Function to render current data window
    function renderDataWindow() {
        cells.forEach((cell, index) => {
            // Calculate grid position
            const col = index % 8;
            const row = Math.floor(index / 8);
            const columnData = dataWindow[col];
            
            // Reset cell styles
            cell.textContent = '';
            cell.style.fontSize = '2em';  // Default larger size for all numbers
            cell.style.color = 'white';
            cell.style.fontWeight = 'bold';
            cell.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
            
            // Find if there's a fret number for this string in this column
            if (columnData) {
                Object.entries(columnData).forEach(([string, fret]) => {
                    // Check if this cell's row matches the string's row in our mapping
                    if (STRING_MAP[string] === row) {
                        cell.textContent = fret;
                        
                        // Special highlighting for the first column (current play position)
                        if (col === 0) {
                            cell.style.color = 'orange';
                            cell.style.fontSize = '2.5em';
                            cell.style.fontWeight = 'bolder';
                        }
                    }
                });
            }
        });
    }

    // Initialize state
    let previousTick = Date.now();

    /**
     * Start animation loop
     */
    function startAnimation() {
        function loop() {
            // Stop if cleaned up
            if (isCleanedUp) {
                return;
            }

            if (helpers.isPaused()) {
                animationFrameId = requestAnimationFrame(loop); // Keep checking while paused
                return;
            }

            const now = Date.now();
            const bpm = helpers.getBPM?.() || 40;
            const interval = 60000 / bpm;

            if (now - previousTick >= interval) {
                // Don't trigger events if cleaned up
                if (!isCleanedUp) {
                    // Trigger metronome tick
                    helpers.metronomeTick();
                    
                    // Update and render next position
                    updateDataWindow();
                    renderDataWindow();
                    
                    // Update previous tick time
                    previousTick = now;
                }
            }

            if (!isCleanedUp && helpers.timer.getRemaining() > 0) {
                animationFrameId = requestAnimationFrame(loop);
            } else {
                cleanup();
            }
        }

        if (!isCleanedUp) {
            animationFrameId = requestAnimationFrame(loop);
        }
    }

    // Start the animation
    startAnimation();

    // Clean up on window unload
    window.addEventListener('unload', cleanup);

    // Return promise that resolves when cleanup occurs
    return cleanup;
}
