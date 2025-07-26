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
        }
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
        this.prevButton.classList.add('disabled');
        this.nextButton.classList.add('disabled');
        this.playButton.disabled = true;
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
