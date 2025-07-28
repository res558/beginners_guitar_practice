/**
 * Exercise execution controller
 */

import { createTimer } from './timer.js';
import { getBPM, playTick, setupMetronomeUI } from './metronome.js';
import { getReady, updateTitle, updateTimerLabel, loadExerciseList, setupThemeToggle } from './helpers.js';

class ExerciseController {
    constructor() {
        // State
        this.exercises = [];
        this.currentIndex = 0;
        this.isPaused = true;
        this.currentExercise = null;
        this.currentCleanup = null;
        this.timer = null;

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
     * Start or resume exercise
     */
    async play() {
        if (!this.exercises.length) return;

        this.isPaused = false;
        this.playButton.textContent = 'Pause';

        if (!this.currentExercise) {
            // Start new exercise
            await this.startExercise(this.currentIndex);
        } else {
            // Resume current exercise
            this.timer?.resume();
        }
    }

    /**
     * Pause exercise
     */
    pause() {
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

        // Update navigation buttons but disable them during countdown
        this.updateNavigationButtons(this.currentIndex, this.exercises.length);
        this.disableNavigation();

        try {
            // Prepare UI
            await getReady(this.currentExercise.name, this.currentExercise.duration, this.currentExercise.type);
        } catch (error) {
            // If countdown was cancelled, re-enable navigation and exit
            this.enableNavigation();
            return;
        }

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
                animation: 'blink-out 0.5s forwards',
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
            await this.startExercise(this.currentIndex - 1);
            this.updateNavigationButtons(this.currentIndex, this.exercises.length);
        }
    }

    /**
     * Move to next exercise
     */
    async next() {
        if (this.currentIndex < this.exercises.length - 1) {
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
