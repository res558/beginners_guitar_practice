/**
 * Spider exercise module
 * Implements interactive fretboard visualization for spider exercises using responsive SVG
 */

// Animation state
let animationFrameId = null;

// SVG Constants for layout
const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
const NUM_COLUMNS = 8;
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 400;
const STRING_SPACING = VIEW_HEIGHT / (STRINGS.length + 1);
const COLUMN_WIDTH = VIEW_WIDTH / NUM_COLUMNS;
const SVG_NS = "http://www.w3.org/2000/svg";

// String to index mapping
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
    let textElements = []; // Track SVG text elements for cleanup
    let svg = null;
    
    // Get container and ensure it exists
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }
    
    // Handle window resize for responsive design
    function handleResize() {
        if (svg) {
            // SVG is already responsive, but we can trigger a re-render if needed
            renderDataWindow();
        }
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
        window.removeEventListener('resize', handleResize);
        
        // Clear SVG and text elements
        textElements = [];
        
        // Remove DOM elements
        container.innerHTML = '';
        svg = null;
    }

    // Create SVG fretboard
    function createSVGFretboard() {
        // Clear container
        container.innerHTML = '';
        
        // Create exercise title (optional, can be commented out)
        //const titleElement = document.createElement('div');
        //titleElement.style.textAlign = 'center';
        //titleElement.style.marginBottom = '20px';
        //titleElement.style.fontSize = '1.2em';
        //titleElement.style.fontWeight = 'bold';
        //titleElement.style.color = 'var(--primary-text)';
        //titleElement.textContent = `Spider Walk - ${exercise.name}`;
        //container.appendChild(titleElement);
        
        // Create SVG element
        svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('id', 'spider-fretboard');
        svg.setAttribute('viewBox', `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.maxWidth = '800px';
        svg.style.margin = '0 auto';
        svg.style.border = '2px solid var(--border)';
        svg.style.borderRadius = '8px';
        svg.style.backgroundColor = 'var(--card-bg)';
        
        container.appendChild(svg);
        
        drawFretboard();
    }

    // Draw the static fretboard structure
    function drawFretboard() {
        if (!svg) return;
        
        // Clear existing content
        svg.innerHTML = '';
        
        // Add CSS styles to SVG
        const style = document.createElementNS(SVG_NS, 'style');
        style.textContent = `
            .string-line {
                stroke: var(--primary-text);
                stroke-width: 2;
                opacity: 0.8;
            }
            .fretline {
                stroke: var(--border);
                stroke-width: 1;
                opacity: 0.6;
            }
            .fret-highlight {
                stroke: var(--accent);
                stroke-width: 3;
                opacity: 0.9;
            }
            .fret-text {
                fill: var(--primary-text);
                font-family: 'Segoe UI', Arial, sans-serif;
                text-anchor: middle;
                dominant-baseline: central;
                font-size: 24px;
                font-weight: bold;
            }
            .fret-text-current {
                fill: var(--accent);
                font-size: 28px;
                font-weight: bolder;
            }
        `;
        svg.appendChild(style);
        
        // Draw horizontal string lines
        STRINGS.forEach((stringName, i) => {
            const y = STRING_SPACING * (i + 1);
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', 40);
            line.setAttribute('y1', y);
            line.setAttribute('x2', VIEW_WIDTH - 40);
            line.setAttribute('y2', y);
            line.classList.add('string-line');
            svg.appendChild(line);
            
            // Add string name labels
            const stringLabel = document.createElementNS(SVG_NS, 'text');
            stringLabel.setAttribute('x', 20);
            stringLabel.setAttribute('y', y);
            stringLabel.setAttribute('class', 'fret-text');
            stringLabel.style.fontSize = '20px';
            stringLabel.style.fill = 'var(--muted-text)';
            stringLabel.textContent = stringName;
            svg.appendChild(stringLabel);
        });
        
        // Draw vertical fret lines
        for (let col = 0; col <= NUM_COLUMNS; col++) {
            const x = 40 + col * ((VIEW_WIDTH - 80) / NUM_COLUMNS);
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', STRING_SPACING);
            line.setAttribute('x2', x);
            line.setAttribute('y2', STRING_SPACING * STRINGS.length);
            
            if (col === 1) { // Highlight first column (current position)
                line.classList.add('fret-highlight');
            } else {
                line.classList.add('fretline');
            }
            svg.appendChild(line);
        }
    }

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

    // Render or update fret numbers at specific column
    function renderTextAt(colIndex, mapEntry) {
        if (!svg || !mapEntry || mapEntry === ',' || mapEntry === '') return;

        const [stringName, fret] = mapEntry.split(',');
        if (!stringName || !fret || !(stringName in STRING_MAP)) return;

        const stringIdx = STRING_MAP[stringName];
        let x = 40 + (colIndex + 0.5) * ((VIEW_WIDTH - 80) / NUM_COLUMNS);
        let y = STRING_SPACING * (stringIdx + 1);

        const txt = document.createElementNS(SVG_NS, 'text');
        
        // Highlight first column (current position) with special positioning and styling
        if (colIndex === 0) {
            x -= 10; // Subtract 10 from X position for first column
            y += 15;  // Add 7 to Y position for first column
            txt.setAttribute('x', x);
            txt.setAttribute('y', y);
            txt.textContent = fret;
            txt.classList.add('fret-text-current');
            txt.style.fontSize = '4em'; // Make font size 4em for first column
        } else {
            txt.setAttribute('x', x);
            txt.setAttribute('y', y);
            txt.textContent = fret;
            txt.classList.add('fret-text');
            txt.style.fontSize = '3em'; // Make font size 3em for other columns
        }
        
        svg.appendChild(txt);
        textElements.push(txt);
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

    // Function to render current data window on SVG
    function renderDataWindow() {
        if (!svg) return;
        
        // Clear existing text elements
        textElements.forEach(el => {
            if (el.parentNode) {
                svg.removeChild(el);
            }
        });
        textElements = [];
        
        // Render each column's data
        dataWindow.forEach((columnData, colIndex) => {
            if (columnData) {
                Object.entries(columnData).forEach(([string, fret]) => {
                    renderTextAt(colIndex, `${string},${fret}`);
                });
            }
        });
    }

    // Initialize SVG fretboard
    createSVGFretboard();
    
    // Initial render of the data window
    renderDataWindow();
    
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
    
    window.addEventListener('resize', handleResize);

    // Clean up on window unload
    window.addEventListener('unload', cleanup);

    // Return promise that resolves when cleanup occurs
    return cleanup;
}
