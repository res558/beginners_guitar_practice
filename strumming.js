let animationFrameId = null;
let loop = null;

export async function execute(exercise, containerId, helpers) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    container.innerHTML = '';

    const originalBPM = helpers.getBPM?.();
    if (helpers.setBPM) {
        helpers.setBPM(100, false); // initial BPM for strumming only
    }

    const mainWrapper = document.createElement('div');
    mainWrapper.style.display = 'flex';
    mainWrapper.style.width = '100%';
    mainWrapper.style.height = '100%';

    const chordsDiv = document.createElement('div');
    chordsDiv.style.flex = '0 0 25%';
    chordsDiv.style.display = 'flex';
    chordsDiv.style.flexDirection = 'column';
    chordsDiv.style.alignItems = 'center';
    chordsDiv.style.justifyContent = 'center';
    chordsDiv.style.gap = '10px';

    const patternDiv = document.createElement('div');
    patternDiv.style.flex = '1';
    patternDiv.style.display = 'grid';
    patternDiv.style.gridTemplateColumns = 'repeat(8, 1fr)';
    patternDiv.style.gridTemplateRows = 'auto auto';
    patternDiv.style.alignItems = 'center';
    patternDiv.style.justifyItems = 'center';
    patternDiv.style.padding = '10px';

    const arrowElements = [];
    const beatLabels = ['1', '+', '2', '+', '3', '+', '4', '+'];
    const directions = ['↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑'];

    directions.forEach((arrow) => {
        const arrowEl = document.createElement('div');
        arrowEl.textContent = arrow;
        arrowEl.style.fontSize = '5em';
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
        beatEl.style.fontSize = '2.5em';
        patternDiv.appendChild(beatEl);
    });

    const nowLabel = document.createElement('div');
    nowLabel.textContent = 'Now';

    const nowWrapper = document.createElement('div');
    nowWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    nowWrapper.style.borderRadius = '12px';
    nowWrapper.style.padding = '10px';
    nowWrapper.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.2)';
    nowWrapper.style.backdropFilter = 'blur(2px)';
    nowWrapper.style.display = 'flex';
    nowWrapper.style.justifyContent = 'center';

    const nowImg = document.createElement('img');
    nowImg.style.width = '60px';
    nowWrapper.appendChild(nowImg);

    const nextLabel = document.createElement('div');
    nextLabel.textContent = 'Next';

    const nextWrapper = document.createElement('div');
    nextWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    nextWrapper.style.borderRadius = '12px';
    nextWrapper.style.padding = '10px';
    nextWrapper.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.2)';
    nextWrapper.style.backdropFilter = 'blur(2px)';
    nextWrapper.style.display = 'flex';
    nextWrapper.style.justifyContent = 'center';

    const nextImg = document.createElement('img');
    nextImg.style.width = '100px';
    nextWrapper.appendChild(nextImg);

    chordsDiv.appendChild(nowLabel);
    chordsDiv.appendChild(nowWrapper);
    chordsDiv.appendChild(nextLabel);
    chordsDiv.appendChild(nextWrapper);

    mainWrapper.appendChild(chordsDiv);
    mainWrapper.appendChild(patternDiv);
    container.appendChild(mainWrapper);

    // These were missing!
    let subTickCount = 0;
    let previousTick = Date.now();

    let chordList = exercise.chordsTo || [];
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

                    if (active && index % 2 === 0) {
                        helpers.metronomeTick();
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

                    if (active && index % 2 === 0) {
                        helpers.metronomeTick();
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

                if (active && index % 2 === 0) {
                    helpers.metronomeTick();
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
                el.style.scale = '2';
            } else {
                el.style.backgroundColor = 'transparent';
                el.style.color = 'inherit';
                el.style.fontWeight = 'normal';
                el.style.scale = '1';
            }
        });
    }

    function chordImage(name) {
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
        if (originalBPM && helpers.setBPM) {
            helpers.setBPM(originalBPM, false);
        }
        window.removeEventListener('unload', cleanup);
    }

    return cleanup;
}
