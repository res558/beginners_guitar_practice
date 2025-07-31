/**
 * Exercise execution controller
 */

import { createTimer } from './timer.js';
import { getBPM, setBPM, playTick, setupMetronomeUI } from './metronome.js';
import { updateTitle, updateTimerLabel, loadExerciseList, setupThemeToggle } from './helpers.js';

class ExerciseController {
    constructor() {
        // State
        this.exercises = [];
        this.currentIndex = 0;
        this.isPaused = true;
        this.currentExercise = null;
        this.currentCleanup = null;
        this.timer = null;
        this.countdownInterval = null; // Track countdown interval

        // UI Elements
        this.playButton = document.getElementById('playButton');
        this.prevButton = document.getElementById('prevBtn');
        this.nextButton = document.getElementById('nextBtn');
        this.executionArea = document.getElementById('executionArea');

        // Exercise type to module mapping
        this.moduleMap = {
            1: () => import('./spider.js'),
            2: () => import('./chordFromTo.js'),
            3: () => import('./chordsRandom.js'),
            4: () => import('./strumming.js')
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize controller
     */
    async init() {
        // Load exercises
        this.exercises = loadExerciseList();

        // Setup theme
        setupThemeToggle();

        // Setup metronome
        setupMetronomeUI();

        // Setup controls
        this.setupEventListeners();

        // Update UI state
        this.updateNavigationButtons(this.currentIndex, this.exercises.length);
    }

    /**
     * Setup event listeners for controls
     */
    setupEventListeners() {
        this.playButton.addEventListener('click', () => this.togglePlayPause());
        this.prevButton.addEventListener('click', () => this.previous());
        this.nextButton.addEventListener('click', () => this.next());
    }

    /**
     * Toggle play/pause state
     */
    async togglePlayPause() {
        if (this.playButton.textContent === 'Play') {
            await this.play();
        } else {
            this.pause();
        }
    }

    /**
     * Show countdown before starting/resuming exercise
     * @returns {Promise} Resolves when countdown is complete
     */
    async showCountdown() {
        // Prevent multiple countdowns from starting
        if (this.countdownInterval) {
            return; // Already counting down
        }
        
        return new Promise((resolve, reject) => {
            const executionArea = document.getElementById('executionArea');

            // Create countdown overlay
            const countdownDiv = document.createElement('div');
            countdownDiv.style.position = 'absolute';
            countdownDiv.style.top = '0';
            countdownDiv.style.left = '0';
            countdownDiv.style.width = '100%';
            countdownDiv.style.height = '100%';
            countdownDiv.style.display = 'flex';
            countdownDiv.style.justifyContent = 'center';
            countdownDiv.style.alignItems = 'center';
            countdownDiv.style.fontSize = '5em';
            countdownDiv.style.fontWeight = 'bold';
            countdownDiv.style.color = '#00fff7';
            countdownDiv.style.zIndex = '9999';
            countdownDiv.style.pointerEvents = 'none';
            countdownDiv.style.textShadow = `
                -3px -3px 0 #000, 
                3px -3px 0 #000, 
                -3px  3px 0 #000, 
                3px  3px 0 #000
                `;

            executionArea.appendChild(countdownDiv);

            let count = 3;
            countdownDiv.textContent = count;

            this.countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownDiv.textContent = count;
                } else {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                    this.cancelCountdown = null;
                    countdownDiv.remove();
                    resolve();
                }
            }, 1000);

            // Allow external cancellation
            this.cancelCountdown = () => {
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
                this.cancelCountdown = null;
                countdownDiv.remove();
                reject(new Error('Countdown cancelled'));
            };
        });
    }

    /**
     * Start or resume exercise
     */
    async play() {
        if (!this.exercises.length) return;

        // Change button to Pause immediately when countdown starts
        // But keep exercise paused until countdown finishes
        this.playButton.textContent = 'Pause';

        try {
            // Show countdown before starting/resuming
            await this.showCountdown();

            // Only after countdown completes, actually start or resume exercise
            this.isPaused = false;
            
            if (!this.currentExercise) {
                // Start new exercise
                await this.startExercise(this.currentIndex);
            } else {
                // Resume current exercise
                this.timer?.resume();
            }
        } catch (error) {
            // Countdown was cancelled, reset button state
            this.isPaused = true;
            this.playButton.textContent = 'Play';
            console.log('Countdown cancelled');
        }
    }

    /**
     * Pause exercise
     */
    pause() {
        // Cancel countdown if it's running
        if (this.cancelCountdown) {
            this.cancelCountdown();
            this.cancelCountdown = null;
        }
        
        this.isPaused = true;
        this.playButton.textContent = 'Play';
        this.timer?.pause();
    }

    /**
     * Start a specific exercise
     */
    async startExercise(index) {
        // Clean up previous exercise
        await this.cleanup();

        // Get exercise data
        this.currentIndex = index;
        this.currentExercise = this.exercises[index];

        // Google Analytics tracking for exercise queue start (only for first exercise)
        if (this.currentIndex === 0 && typeof gtag !== 'undefined') {
            gtag('event', 'exercise_queue_start', {
                event_category: 'exercise_flow',
                event_label: 'exercises',
                value: this.exercises.length
            });
        }

        // Update navigation buttons and disable them during exercise startup
        this.updateNavigationButtons(this.currentIndex, this.exercises.length);
        this.disableNavigation();

        // Prepare UI - update title and timer
        updateTitle(this.currentExercise.name, this.currentExercise.type);
        updateTimerLabel(this.currentExercise.duration * 60);

        // Create timer
        this.timer = createTimer(
            this.currentExercise.duration * 60,
            (remaining) => updateTimerLabel(remaining),
            () => this.onExerciseComplete()
        );

        // Load and start exercise module
        try {
            const module = await this.moduleMap[this.currentExercise.type]();

            // Helper functions for exercise modules
            const helpers = {
                metronomeTick: playTick,
                getBPM,
                setBPM,
                timer: this.timer,
                isPaused: () => this.isPaused
            };

            // Execute exercise
            this.currentCleanup = await module.execute(
                this.currentExercise,
                'executionArea',
                helpers
            );

            // Start timer and re-enable navigation
            this.timer.start();
            this.enableNavigation();

            // Auto-pause the exercise so user needs to press Play to begin
            // This happens after the exercise content is rendered
            // Only auto-pause if this is NOT the first exercise (index > 0)
            if (this.currentIndex > 0) {
                setTimeout(() => {
                    this.pause();
                }, 100); // Small delay to ensure content is rendered
            }
        } catch (error) {
            console.error('Error loading exercise module:', error);
            this.cleanup();
        }
    }

    /**
     * Handle exercise completion
     */
    async onExerciseComplete() {
        if (this.currentIndex < this.exercises.length - 1) {
            await this.next();
        } else {
            await this.cleanup();
            this.playButton.textContent = 'Play';
            updateTitle('Workout Complete!');
            
            // Google Analytics tracking for exercise queue finished
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exercise_queue_finished', {
                    event_category: 'exercise_flow',
                    event_label: 'exercises',
                    value: this.exercises.length
                });
            }
            
            this.showFireworksCelebration();
            this.disableNavigation();
        }
    }


    showFireworksCelebration() {
        // Create canvas overlay
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
        });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Firework + particle logic
        const particles = [];

        function spawnGuitarIconAndFirework() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.8;

            // Guitar emoji "exploding" into particles
            const emoji = document.createElement('div');
            emoji.textContent = '🎸';
            Object.assign(emoji.style, {
                position: 'fixed',
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem',
                zIndex: 10000,
                animation: 'blink-out 2s forwards',
                pointerEvents: 'none',
            });
            document.body.appendChild(emoji);

            // Remove emoji after blink and spawn particles
            setTimeout(() => {
                emoji.remove();
                spawnParticles(x, y);
            }, 500);
        }

        function spawnParticles(x, y) {
            const count = 30 + Math.floor(Math.random() * 30);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const speed = Math.random() * 4 + 2;
                particles.push({
                    x, y,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    radius: 2 + Math.random() * 2,
                    color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`,
                    life: 60,
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.dx;
                p.y += p.dy;
                p.life--;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].life <= 0) particles.splice(i, 1);
            }
            requestAnimationFrame(animate);
        }

        animate();

        // Spawn fireworks and guitars continuously for 5 seconds
        const interval = setInterval(spawnGuitarIconAndFirework, 300);
        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                canvas.remove();
            }, 1000);
        }, 5000);

        // Keyframe animation for emoji blink
        const style = document.createElement('style');
        style.textContent = `
        @keyframes blink-out {
            0% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
            100% { opacity: 0; transform: scale(0.1) translate(-50%, -50%); }
        }
    `;
        document.head.appendChild(style);
    }



    /**
     * Move to previous exercise
     */
    async previous() {
        if (this.currentIndex > 0) {
            // Cancel any ongoing countdown
            if (this.cancelCountdown) {
                this.cancelCountdown();
                this.cancelCountdown = null;
            }

            await this.startExercise(this.currentIndex - 1);
            this.updateNavigationButtons(this.currentIndex, this.exercises.length);
        }
    }

    /**
     * Move to next exercise
     */
    async next() {
        if (this.currentIndex < this.exercises.length - 1) {
            // Cancel any ongoing countdown
            if (this.cancelCountdown) {
                this.cancelCountdown();
                this.cancelCountdown = null;
            }

            await this.startExercise(this.currentIndex + 1);
            this.updateNavigationButtons(this.currentIndex, this.exercises.length);
        }
    }

    /**
     * Update navigation button states
     * @param {number} currentIndex - Current exercise index
     * @param {number} total - Total number of exercises
     */
    updateNavigationButtons(currentIndex, total) {

        this.playButton.disabled = false;
        this.playButton.classList.remove('disabled');

        if (currentIndex <= 0) {
            this.prevButton.disabled = true;
            this.prevButton.classList.add('disabled');
        } else {
            this.prevButton.disabled = false;
            this.prevButton.classList.remove('disabled');
        }

        if (currentIndex >= total - 1) {
            this.nextButton.disabled = true;
            this.nextButton.classList.add('disabled');
        } else {
            this.nextButton.disabled = false;
            this.nextButton.classList.remove('disabled');
        }
    }

    /**
     * Clean up current exercise
     */
    async cleanup() {
        if (this.currentCleanup) {
            await this.currentCleanup();
            this.currentCleanup = null;
        }

        // Additional cleanup for strumming exercise BPM restoration
        // This ensures BPM is restored even if the exercise cleanup didn't run properly
        try {
            const strummingModule = await import('./strumming.js');
            if (strummingModule.cleanupStrummingBPM) {
                const helpers = {
                    getBPM,
                    setBPM: (value, save) => setBPM(value, save)
                };
                strummingModule.cleanupStrummingBPM(helpers);
            }
        } catch (e) {
            // Silently handle if strumming module is not available
        }

        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }

        this.currentExercise = null;
        this.executionArea.innerHTML = '';
    }

    /**
     * Disable navigation buttons
     */
    disableNavigation() {
        this.prevButton.disabled = true;
        this.nextButton.disabled = true;
        this.playButton.disabled = true;
        this.prevButton.classList.add('disabled');
        this.nextButton.classList.add('disabled');
        this.playButton.classList.add('disabled');
    }

    /**
     * Enable navigation buttons based on current position
     */
    enableNavigation() {
        // Re-evaluate button states based on current position
        this.updateNavigationButtons(this.currentIndex, this.exercises.length);
    }
}

// Initialize controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ExerciseController();
});
