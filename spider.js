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
            
            // Highlight the line where notes should arrive (same as old first column position)
            if (col === 0) { 
                line.classList.add('fret-highlight');
            } else {
                line.classList.add('fretline');
            }
            svg.appendChild(line);
        }
        
        // Draw the main highlight line where notes arrive
        const highlightLine = document.createElementNS(SVG_NS, 'line');
        const highlightX = 40 + ((VIEW_WIDTH - 80) / NUM_COLUMNS) * 0.5; // Same as NOTE_SPACING * 0.5
        highlightLine.setAttribute('x1', highlightX);
        highlightLine.setAttribute('y1', STRING_SPACING);
        highlightLine.setAttribute('x2', highlightX);
        highlightLine.setAttribute('y2', STRING_SPACING * STRINGS.length);
        highlightLine.classList.add('fret-highlight');
        svg.appendChild(highlightLine);
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

    // Initialize note positions and data
    let notes = []; // Array of {string, fret, x, highlighted}
    let spiderMapIndex = 0;
    let lastBeatTime = Date.now();
    let animationStartTime = Date.now();
    let scrollOffset = 0; // Pixel offset for smooth scrolling
    
    // Constants for positioning
    const NOTE_SPACING = (VIEW_WIDTH - 80) / 8; // Distance between notes (same as old column spacing)
    const HIGHLIGHT_X = 40 + NOTE_SPACING * 0.5; // X position of the highlight line
    
    // Initialize notes with first 8 positions
    function initializeNotes() {
        notes = [];
        for (let i = 0; i < 8; i++) {
            const position = exercise.spiderMap[i % exercise.spiderMap.length];
            const parsedPosition = parseSpiderPosition(position);
            
            // Add each string,fret pair as a note
            Object.entries(parsedPosition).forEach(([string, fret]) => {
                notes.push({
                    string: string,
                    fret: fret,
                    x: 40 + (i + 0.5) * NOTE_SPACING, // Initial X position
                    highlighted: i === 0 // First note starts highlighted
                });
            });
        }
        spiderMapIndex = 8 % exercise.spiderMap.length;
    }
    
    // Add a new note at the rightmost position
    function addNewNote() {
        const position = exercise.spiderMap[spiderMapIndex];
        const parsedPosition = parseSpiderPosition(position);
        
        Object.entries(parsedPosition).forEach(([string, fret]) => {
            notes.push({
                string: string,
                fret: fret,
                x: 40 + 7.5 * NOTE_SPACING, // Start at the 8th position
                highlighted: false
            });
        });
        
        spiderMapIndex = (spiderMapIndex + 1) % exercise.spiderMap.length;
    }
    
    // Update note positions and manage highlighting
    function updateNotes(currentTime, bpm) {
        const beatInterval = 60000 / bpm; // Time between beats in milliseconds
        
        // Check if it's time for the next beat
        if (currentTime - lastBeatTime >= beatInterval) {
            lastBeatTime = currentTime;
            animationStartTime = currentTime;
            scrollOffset = 0;
            
            // Move all notes one position to the left
            notes.forEach(note => {
                note.x -= NOTE_SPACING;
                note.highlighted = false; // Clear all highlights
            });
            
            // Remove notes that have moved off screen (x < 0)
            notes = notes.filter(note => note.x > 0);
            
            // Highlight notes that are now at the highlight position
            notes.forEach(note => {
                const distanceToHighlight = Math.abs(note.x - HIGHLIGHT_X);
                if (distanceToHighlight < NOTE_SPACING * 0.1) { // Within 10% of spacing
                    note.highlighted = true;
                }
            });
            
            // Add new note if we need more notes
            const rightmostX = Math.max(...notes.map(n => n.x), 0);
            if (rightmostX < 40 + 7 * NOTE_SPACING) {
                addNewNote();
            }
            
            return true; // Beat occurred
        } else {
            // Smooth scrolling between beats
            const timeSinceLastBeat = currentTime - lastBeatTime;
            const progressToNextBeat = timeSinceLastBeat / beatInterval;
            const targetOffset = progressToNextBeat * NOTE_SPACING;
            
            // Update visual positions for smooth scrolling
            notes.forEach(note => {
                // Don't modify the actual note.x, just calculate display position
            });
            
            scrollOffset = targetOffset;
            return false; // No beat occurred
        }
    }

    // Function to render all notes on SVG
    function renderDataWindow() {
        if (!svg) return;
        
        // Clear existing text elements
        textElements.forEach(el => {
            if (el.parentNode) {
                svg.removeChild(el);
            }
        });
        textElements = [];
        
        // Render each note
        notes.forEach(note => {
            const displayX = note.x - scrollOffset; // Apply smooth scrolling offset
            
            if (displayX > 0 && displayX < VIEW_WIDTH) { // Only render visible notes
                const stringIdx = STRING_MAP[note.string];
                const y = STRING_SPACING * (stringIdx + 1);
                
                const txt = document.createElementNS(SVG_NS, 'text');
                txt.setAttribute('x', displayX);
                txt.setAttribute('y', y);
                txt.textContent = note.fret;
                
                if (note.highlighted) {
                    txt.classList.add('fret-text-current');
                    txt.style.fontSize = '4em';
                    txt.setAttribute('y', y+25);
                    txt.setAttribute('x', displayX-20);
                } else {
                    txt.classList.add('fret-text');
                    txt.style.fontSize = '3em';
                }
                
                svg.appendChild(txt);
                textElements.push(txt);
            }
        });
    }

    // Initialize SVG fretboard
    createSVGFretboard();
    
    // Initialize notes
    initializeNotes();
    
    // Initial render of the notes
    renderDataWindow();

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

            // Update notes position and handle beat timing
            const beatOccurred = updateNotes(now, bpm);
            
            // Trigger metronome on beat
            if (beatOccurred && !isCleanedUp) {
                helpers.metronomeTick();
            }
            
            // Re-render notes with their new positions
            renderDataWindow();

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
