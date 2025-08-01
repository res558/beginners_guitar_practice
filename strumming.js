let animationFrameId = null;
let loop = null;
let originalBPMForStrumming = null; // Store original BPM value for restoration

/**
 * Global cleanup function that can be called from outside the module
 * to ensure BPM is restored when switching exercises or leaving the page
 */
export function cleanupStrummingBPM(helpers) {
    let bpmToRestore = originalBPMForStrumming;
    
    // Try to get from temporary storage if variable is lost
    if (bpmToRestore === null || bpmToRestore === undefined) {
        try {
            const tempSettings = sessionStorage.getItem('strummingTempBPM');
            if (tempSettings) {
                const parsed = JSON.parse(tempSettings);
                // Only use if it's recent (within last hour to avoid stale data)
                if (Date.now() - parsed.timestamp < 3600000) {
                    bpmToRestore = parsed.originalBPM;
                }
            }
        } catch (e) {
            console.warn('Error retrieving temporary BPM setting:', e);
        }
    }
    
    // Restore the original BPM (don't save to persistent storage to preserve user's setting)
    if (bpmToRestore !== null && bpmToRestore !== undefined && helpers && helpers.setBPM) {
        helpers.setBPM(bpmToRestore, false); // false = don't overwrite user's saved settings
    }
    
    // Clean up temporary storage
    sessionStorage.removeItem('strummingTempBPM');
    originalBPMForStrumming = null;
}

export async function execute(exercise, containerId, helpers) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    container.innerHTML = '';

    // Save current BPM before setting strumming BPM
    originalBPMForStrumming = helpers.getBPM?.();
    
    // Store original BPM in temporary storage for this exercise
    if (originalBPMForStrumming !== null && originalBPMForStrumming !== undefined) {
        const tempSettings = { originalBPM: originalBPMForStrumming, timestamp: Date.now() };
        sessionStorage.setItem('strummingTempBPM', JSON.stringify(tempSettings));
    }
    
    // Set BPM to 100 for strumming exercise (don't save to persistent settings)
    if (helpers.setBPM) {
        helpers.setBPM(100, false); // false = don't save to persistent storage
    }

    const mainWrapper = document.createElement('div');
    mainWrapper.style.display = 'flex';
    mainWrapper.style.width = '100%';
    mainWrapper.style.height = '100%';
    mainWrapper.style.transition = 'all 0.3s ease'; // Smooth layout transitions

    const chordsDiv = document.createElement('div');
    chordsDiv.style.flex = '0 0 25%';
    chordsDiv.style.display = 'flex';
    chordsDiv.style.flexDirection = 'column';
    chordsDiv.style.alignItems = 'center';
    chordsDiv.style.justifyContent = 'center';
    chordsDiv.style.gap = '5px';

    const patternDiv = document.createElement('div');
    patternDiv.style.flex = '1';
    patternDiv.style.display = 'grid';
    patternDiv.style.gridTemplateColumns = 'repeat(8, 1fr)';
    patternDiv.style.gridTemplateRows = 'auto auto';
    patternDiv.style.alignItems = 'center';
    patternDiv.style.justifyItems = 'center';
    patternDiv.style.padding = '0';

    // Check if mobile layout is needed
    const isMobile = window.innerWidth < 768;
    
    // Apply mobile-specific layout adjustments
    if (isMobile) {
        mainWrapper.style.flexDirection = 'column';
        chordsDiv.style.flex = '0 0 auto'; // Let it size naturally
        chordsDiv.style.width = '100%'; // Full width on mobile
        chordsDiv.style.flexDirection = 'row'; // Display Now and Next side by side
        chordsDiv.style.justifyContent = 'space-evenly';
        chordsDiv.style.alignItems = 'flex-start';
        chordsDiv.style.gap = '10px';
        chordsDiv.style.padding = '10px';
        
        // Adjust pattern grid for mobile
        patternDiv.style.flex = '1';
        patternDiv.style.minHeight = '200px'; // Ensure adequate height for visibility
    }

    const arrowElements = [];
    const beatLabels = ['1', '+', '2', '+', '3', '+', '4', '+'];
    const directions = ['↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑'];

    directions.forEach((arrow) => {
        const arrowEl = document.createElement('div');
        arrowEl.textContent = arrow;
        arrowEl.style.fontSize = '3.5em';
        arrowEl.style.transition = 'all 0.2s ease';
        arrowEl.style.padding = '10px';
        arrowEl.style.borderRadius = '8px';
        arrowEl.style.userSelect = 'none';
        patternDiv.appendChild(arrowEl);
        arrowElements.push(arrowEl);
    });

    beatLabels.forEach((label) => {
        const beatEl = document.createElement('div');
        beatEl.textContent = label;
        beatEl.style.fontSize = '1.5em';
        patternDiv.appendChild(beatEl);
    });

    const nowLabel = document.createElement('div');
    nowLabel.textContent = 'Now';

    const nowWrapper = document.createElement('div');
    nowWrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
    nowWrapper.style.borderRadius = '12px';
    nowWrapper.style.padding = '10px';
    nowWrapper.style.boxShadow = '0 0 8px rgba(122, 183, 255, 0.5)';
    nowWrapper.style.backdropFilter = 'blur(2px)';
    nowWrapper.style.display = 'flex';
    nowWrapper.style.justifyContent = 'center';

    const nowImg = document.createElement('img');
    nowImg.style.width = '60px';
    nowWrapper.appendChild(nowImg);

    const nextLabel = document.createElement('div');
    nextLabel.textContent = 'Next';

    const nextWrapper = document.createElement('div');
    nextWrapper.style.backgroundColor = 'rgba(122, 183, 255, 0.5)';
    nextWrapper.style.borderRadius = '12px';
    nextWrapper.style.padding = '10px';
    nextWrapper.style.boxShadow = '0 0 8px rgba(122, 183, 255, 0.5)';
    nextWrapper.style.backdropFilter = 'blur(2px)';
    nextWrapper.style.display = 'flex';
    nextWrapper.style.justifyContent = 'center';

    const nextImg = document.createElement('img');
    nextImg.style.width = '100px';
    nextWrapper.appendChild(nextImg);

    // Create groups for mobile layout (labels above images)
    const nowGroup = document.createElement('div');
    nowGroup.style.display = 'flex';
    nowGroup.style.flexDirection = 'column';
    nowGroup.style.alignItems = 'center';
    nowGroup.style.gap = '5px';
    
    const nextGroup = document.createElement('div');
    nextGroup.style.display = 'flex';
    nextGroup.style.flexDirection = 'column';
    nextGroup.style.alignItems = 'center';
    nextGroup.style.gap = '5px';

    // Apply layout based on screen size
    if (isMobile) {
        // Mobile: horizontal layout with grouped labels and images
        nowGroup.appendChild(nowLabel);
        nowGroup.appendChild(nowWrapper);
        nextGroup.appendChild(nextLabel);
        nextGroup.appendChild(nextWrapper);
        
        chordsDiv.appendChild(nowGroup);
        chordsDiv.appendChild(nextGroup);
        
        // Adjust image sizes for mobile
        nowImg.style.width = '80px';
        nextImg.style.width = '80px';
    } else {
        // Desktop: vertical layout (original)
        chordsDiv.appendChild(nowLabel);
        chordsDiv.appendChild(nowWrapper);
        chordsDiv.appendChild(nextLabel);
        chordsDiv.appendChild(nextWrapper);
    }

    mainWrapper.appendChild(chordsDiv);
    mainWrapper.appendChild(patternDiv);
    container.appendChild(mainWrapper);

    // Add window resize handler for responsive layout
    function handleResize() {
        const newIsMobile = window.innerWidth < 768;
        
        if (newIsMobile !== isMobile) {
            // Layout changed, need to rebuild
            // Store current state
            const currentNowSrc = nowImg.src;
            const currentNextSrc = nextImg.src;
            
            // Clear and rebuild layout
            container.innerHTML = '';
            
            // Recreate with new layout - this is a simplified approach
            // In a more complex app, you might want to preserve more state
            execute(exercise, containerId, helpers).then(cleanup => {
                // Restore image sources if they were set
                if (currentNowSrc) nowImg.src = currentNowSrc;
                if (currentNextSrc) nextImg.src = currentNextSrc;
            });
        }
    }
    
    window.addEventListener('resize', handleResize);

    // These were missing!
    let subTickCount = 0;
    let previousTick = Date.now();

    let chordList = exercise.chords || [];
    let onlyNone = chordList.length === 1 && chordList[0] === 'None';

    if (onlyNone) {
        chordsDiv.style.display = 'none';
    } else {
        chordList = chordList.filter(ch => ch !== 'None');

        if (chordList.length === 1) {
            nowLabel.style.display = 'none';
            nowWrapper.style.display = 'none';
            nextImg.src = chordImage(chordList[0]);
        } else if (chordList.length === 2 || chordList.length === 3) {
            let chordIndex = 0;
            let nextIndex = 1;
            nowImg.src = chordImage(chordList[chordIndex]);
            nextImg.src = chordImage(chordList[nextIndex]);

            loop = function () {
                if (helpers.isPaused()) {
                    animationFrameId = requestAnimationFrame(loop);
                    return;
                }

                const now = Date.now();
                const bpm = helpers.getBPM?.() || 40;
                const halfInterval = 60000 / bpm / 2;

                if (now - previousTick >= halfInterval) {
                    const index = subTickCount % 8;
                    const active = exercise.pattern[index] === 1;

                    highlightColumn(index, active);

                    if (active) {
                        if (index % 2 === 0) {
                            // Down stroke (even indices: 0, 2, 4, 6)
                            helpers.metronomeTick();
                        } else {
                            // Up stroke (odd indices: 1, 3, 5, 7)
                            helpers.metronomeTock();
                        }
                    }

                    if (index === 0 && subTickCount !== 0) {
                        chordIndex = (chordIndex + 1) % chordList.length;
                        nextIndex = (chordIndex + 1) % chordList.length;
                        nowImg.src = chordImage(chordList[chordIndex]);
                        nextImg.src = chordImage(chordList[nextIndex]);
                    }

                    subTickCount++;
                    previousTick = now;
                }

                if (helpers.timer.getRemaining() > 0) {
                    animationFrameId = requestAnimationFrame(loop);
                } else {
                    stopAnimation();
                }
            };
        } else if (chordList.length >= 4) {
            let currentChord = randomChord(chordList);
            let nextChord = randomChord(chordList);
            nowImg.src = chordImage(currentChord);
            nextImg.src = chordImage(nextChord);

            loop = function () {
                if (helpers.isPaused()) {
                    animationFrameId = requestAnimationFrame(loop);
                    return;
                }

                const now = Date.now();
                const bpm = helpers.getBPM?.() || 40;
                const halfInterval = 60000 / bpm / 2;

                if (now - previousTick >= halfInterval) {
                    const index = subTickCount % 8;
                    const active = exercise.pattern[index] === 1;

                    highlightColumn(index, active);

                    if (active) {
                        if (index % 2 === 0) {
                            // Down stroke (even indices: 0, 2, 4, 6)
                            helpers.metronomeTick();
                        } else {
                            // Up stroke (odd indices: 1, 3, 5, 7)
                            helpers.metronomeTock();
                        }
                    }

                    if (index === 0 && subTickCount !== 0) {
                        currentChord = nextChord;
                        let newChord;
                        do {
                            newChord = randomChord(chordList);
                        } while (newChord === currentChord);
                        nextChord = newChord;
                        nowImg.src = chordImage(currentChord);
                        nextImg.src = chordImage(nextChord);
                    }

                    subTickCount++;
                    previousTick = now;
                }

                if (helpers.timer.getRemaining() > 0) {
                    animationFrameId = requestAnimationFrame(loop);
                } else {
                    stopAnimation();
                }
            };
        }
    }

    if (!loop) {
        // Fallback loop for 0–1 chord (or None)
        loop = function () {
            if (helpers.isPaused()) {
                animationFrameId = requestAnimationFrame(loop);
                return;
            }

            const now = Date.now();
            const bpm = helpers.getBPM?.() || 40;
            const halfInterval = 60000 / bpm / 2;

            if (now - previousTick >= halfInterval) {
                const index = subTickCount % 8;
                const active = exercise.pattern[index] === 1;

                highlightColumn(index, active);

                if (active) {
                    if (index % 2 === 0) {
                        // Down stroke (even indices: 0, 2, 4, 6)
                        helpers.metronomeTick();
                    } else {
                        // Up stroke (odd indices: 1, 3, 5, 7)
                        helpers.metronomeTock();
                    }
                }

                subTickCount++;
                previousTick = now;
            }

            if (helpers.timer.getRemaining() > 0) {
                animationFrameId = requestAnimationFrame(loop);
            } else {
                stopAnimation();
            }
        };
    }

    if (typeof loop === 'function') {
        animationFrameId = requestAnimationFrame(loop);
    }

    window.addEventListener('unload', cleanup);

    function highlightColumn(index, active) {
        arrowElements.forEach((el, i) => {
            if (i === index && active) {
                el.style.backgroundColor = 'var(--accent-color)';
                el.style.color = '#f00';
                el.style.fontWeight = 'bold';
                el.style.scale = '1.5';
            } else {
                el.style.backgroundColor = 'transparent';
                el.style.color = 'inherit';
                el.style.fontWeight = 'normal';
                el.style.scale = '1';
            }
        });
    }

    function chordImage(name) {
        console.log(`Loading chord image for: |${name}|`);
        return `chords/${name}.png`;
    }

    function randomChord(list) {
        const i = Math.floor(Math.random() * list.length);
        return list[i];
    }

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function cleanup() {
        stopAnimation();
        
        // Restore BPM using the shared cleanup function
        cleanupStrummingBPM(helpers);
        
        // Clean up event listeners
        window.removeEventListener('unload', cleanup);
        window.removeEventListener('resize', handleResize);
    }

    return cleanup;
}
