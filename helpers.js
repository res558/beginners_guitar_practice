/**
 * Updates timer display with formatted duration
 * @param {number} seconds - Total seconds to format
 * @returns {string} Formatted time string
 */
export function updateTimerLabel(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    document.getElementById('timerArea').textContent = formattedTime;
    return formattedTime;
}

/**
 * Updates exercise title
 * @param {string} name - Exercise name
 */
export function updateTitle(name, type) {
    if (type === 1) {
        document.getElementById('titleArea').textContent = "Spider Walk - " + name;
    //} else if (type === 2) {
    //    document.getElementById('titleArea').textContent = "Chords From/To - " + name;
    //} else if (type === 3) {
    //    document.getElementById('titleArea').textContent = "Chords Random - " + name;
    } else {
        document.getElementById('titleArea').textContent = name;
    }
    
}


/**
 * Shows countdown and prepares exercise
 * @param {string} name - Exercise name
 * @param {number} durationInMin - Exercise duration in minutes
 * @returns {Promise} Resolves when countdown is complete
 */
export async function getReady(name, durationInMin, type) {
    updateTitle(name, type);
    updateTimerLabel(durationInMin * 60);
    
    const executionArea = document.getElementById('executionArea');
    
    // Create centered container div
    const centerDiv = document.createElement('div');
    centerDiv.style.width = '100%';
    centerDiv.style.height = '100%';
    centerDiv.style.position = 'absolute';
    centerDiv.style.top = '0';
    centerDiv.style.left = '0';
    centerDiv.style.display = 'flex';
    centerDiv.style.justifyContent = 'center';
    centerDiv.style.alignItems = 'center';
    centerDiv.style.fontSize = '5em';
    
    executionArea.appendChild(centerDiv);
    centerDiv.textContent = 'Get Ready!';

    // Countdown logic using Promise
    const countdown = async (seconds) => {
        return new Promise(resolve => {
            let remaining = seconds;
            
            const countInterval = setInterval(() => {
                if (remaining === 0) {
                    clearInterval(countInterval);
                    centerDiv.textContent = 'Start!';
                    // Show "Start!" for 1 second, then clean up
                    setTimeout(() => {
                        centerDiv.remove(); // Remove the entire centered div
                        resolve();
                    }, 1000);
                } else {
                    centerDiv.textContent = `Get Ready... ${remaining}`;
                    remaining--;
                }
            }, 1000);
        });
    };

    await countdown(4);
    return true;
}


/**
 * Load exercise list from available storage
 * @returns {Array} Exercise list or empty array if not found
 */
export function loadExerciseList() {
    try {
        // Check sessionStorage first
        const sessionList = sessionStorage.getItem('exerciseList');
        if (sessionList) return JSON.parse(sessionList);

        // Then localStorage
        const localList = localStorage.getItem('exerciseList');
        if (localList) return JSON.parse(localList);

        // Finally check cookies
        const cookieList = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('exerciseList='));
        
        if (cookieList) {
            return JSON.parse(decodeURIComponent(cookieList.split('=')[1]));
        }

        return [];
    } catch (error) {
        console.error('Error loading exercise list:', error);
        return [];
    }
}

/**
 * Save theme preference to all storage types
 * @param {string} theme - Theme name ('light' or 'dark')
 */
export function saveTheme(theme) {
    try {
        // Save to sessionStorage
        sessionStorage.setItem('theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Save to cookies (1 year expiry)
        const oneYear = 365 * 24 * 60 * 60;
        document.cookie = `theme=${theme};path=/;max-age=${oneYear}`;
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme icon
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.src = theme === 'dark' ? 'sun.svg' : 'moon.svg';
        }
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

/**
 * Get saved theme from available storage
 * @returns {string} Theme name ('light' or 'dark')
 */
export function getSavedTheme() {
    try {
        // Check sessionStorage first
        const sessionTheme = sessionStorage.getItem('theme');
        if (sessionTheme) return sessionTheme;

        // Then localStorage
        const localTheme = localStorage.getItem('theme');
        if (localTheme) return localTheme;

        // Finally check cookies
        const cookieTheme = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('theme='))
            ?.split('=')[1];
        
        return cookieTheme || 'light'; // Default to light theme
    } catch (error) {
        console.error('Error getting saved theme:', error);
        return 'light';
    }
}

/**
 * Setup theme toggle functionality
 */
export function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Initialize theme
    const currentTheme = getSavedTheme();
    saveTheme(currentTheme);

    // Setup click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        saveTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}
