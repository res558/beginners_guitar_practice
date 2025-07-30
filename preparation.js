// Constants for exercise configurations
const SPIDER_WALK_MAP = {
    "1234 - 1 to 5": [",", ",", ",", ",", "E,1", "E,2", "E,3", "E,4", "A,1", "A,2", "A,3", "A,4", "D,1", "D,2", "D,3", "D,4", "G,1", "G,2", "G,3", "G,4", "B,1", "B,2", "B,3", "B,4", "e,1", "e,2", "e,3", "e,4", ",", "e,4", "e,3", "e,2", "e,1", "B,4", "B,3", "B,2", "B,1", "G,4", "G,3", "G,2", "G,1", "D,4", "D,3", "D,2", "D,1", "A,4", "A,3", "A,2", "A,1", "E,4", "E,3", "E,2", "E,1", ",", ",", "E,2", "E,3", "E,4", "E,5", "A,2", "A,3", "A,4", "A,5", "D,2", "D,3", "D,4", "D,5", "G,2", "G,3", "G,4", "G,5", "B,2", "B,3", "B,4", "B,5", "e,2", "e,3", "e,4", "e,5", ",", "e,5", "e,4", "e,3", "e,2", "B,5", "B,4", "B,3", "B,2", "G,5", "G,4", "G,3", "G,2", "D,5", "D,4", "D,3", "D,2", "A,5", "A,4", "A,3", "A,2", "E,5", "E,4", "E,3", "E,2", ",", ",", "E,3", "E,4", "E,5", "E,6", "A,3", "A,4", "A,5", "A,6", "D,3", "D,4", "D,5", "D,6", "G,3", "G,4", "G,5", "G,6", "B,3", "B,4", "B,5", "B,6", "e,3", "e,4", "e,5", "e,6", ",", "e,6", "e,5", "e,4", "e,3", "B,6", "B,5", "B,4", "B,3", "G,6", "G,5", "G,4", "G,3", "D,6", "D,5", "D,4", "D,3", "A,6", "A,5", "A,4", "A,3", "E,6", "E,5", "E,4", "E,3", ",", ",", "E,4", "E,5", "E,6", "E,7", "A,4", "A,5", "A,6", "A,7", "D,4", "D,5", "D,6", "D,7", "G,4", "G,5", "G,6", "G,7", "B,4", "B,5", "B,6", "B,7", "e,4", "e,5", "e,6", "e,7", ",", "e,7", "e,6", "e,5", "e,4", "B,7", "B,6", "B,5", "B,4", "G,7", "G,6", "G,5", "G,4", "D,7", "D,6", "D,5", "D,4", "A,7", "A,6", "A,5", "A,4", "E,7", "E,6", "E,5", "E,4", ",", ",", "E,5", "E,6", "E,7", "E,8", "A,5", "A,6", "A,7", "A,8", "D,5", "D,6", "D,7", "D,8", "G,5", "G,6", "G,7", "G,8", "B,5", "B,6", "B,7", "B,8", "e,5", "e,6", "e,7", "e,8", ",", "e,8", "e,7", "e,6", "e,5", "B,8", "B,7", "B,6", "B,5", "G,8", "G,7", "G,6", "G,5", "D,8", "D,7", "D,6", "D,5", "A,8", "A,7", "A,6", "A,5", "E,8", "E,7", "E,6", "E,5", ",", ",", ","],
    "1234 - 5 to 9": [",", ",", ",", ",", "E,5", "E,6", "E,7", "E,8", "A,5", "A,6", "A,7", "A,8", "D,5", "D,6", "D,7", "D,8", "G,5", "G,6", "G,7", "G,8", "B,5", "B,6", "B,7", "B,8", "e,5", "e,6", "e,7", "e,8", ",", "e,8", "e,7", "e,6", "e,5", "B,8", "B,7", "B,6", "B,5", "G,8", "G,7", "G,6", "G,5", "D,8", "D,7", "D,6", "D,5", "A,8", "A,7", "A,6", "A,5", "E,8", "E,7", "E,6", "E,5", ",", ",", "E,6", "E,7", "E,8", "E,9", "A,6", "A,7", "A,8", "A,9", "D,6", "D,7", "D,8", "D,9", "G,6", "G,7", "G,8", "G,9", "B,6", "B,7", "B,8", "B,9", "e,6", "e,7", "e,8", "e,9", ",", "e,9", "e,8", "e,7", "e,6", "B,9", "B,8", "B,7", "B,6", "G,9", "G,8", "G,7", "G,6", "D,9", "D,8", "D,7", "D,6", "A,9", "A,8", "A,7", "A,6", "E,9", "E,8", "E,7", "E,6", ",", ",", "E,7", "E,8", "E,9", "E,10", "A,7", "A,8", "A,9", "A,10", "D,7", "D,8", "D,9", "D,10", "G,7", "G,8", "G,9", "G,10", "B,7", "B,8", "B,9", "B,10", "e,7", "e,8", "e,9", "e,10", ",", "e,10", "e,9", "e,8", "e,7", "B,10", "B,9", "B,8", "B,7", "G,10", "G,9", "G,8", "G,7", "D,10", "D,9", "D,8", "D,7", "A,10", "A,9", "A,8", "A,7", "E,10", "E,9", "E,8", "E,7", ",", ",", "E,8", "E,9", "E,10", "E,11", "A,8", "A,9", "A,10", "A,11", "D,8", "D,9", "D,10", "D,11", "G,8", "G,9", "G,10", "G,11", "B,8", "B,9", "B,10", "B,11", "e,8", "e,9", "e,10", "e,11", ",", "e,11", "e,10", "e,9", "e,8", "B,11", "B,10", "B,9", "B,8", "G,11", "G,10", "G,9", "G,8", "D,11", "D,10", "D,9", "D,8", "A,11", "A,10", "A,9", "A,8", "E,11", "E,10", "E,9", "E,8", ",", ",", "E,9", "E,10", "E,11", "E,12", "A,9", "A,10", "A,11", "A,12", "D,9", "D,10", "D,11", "D,12", "G,9", "G,10", "G,11", "G,12", "B,9", "B,10", "B,11", "B,12", "e,9", "e,10", "e,11", "e,12", ",", "e,12", "e,11", "e,10", "e,9", "B,12", "B,11", "B,10", "B,9", "G,12", "G,11", "G,10", "G,9", "D,12", "D,11", "D,10", "D,9", "A,12", "A,11", "A,10", "A,9", "E,12", "E,11", "E,10", "E,9", ",", ",", ","],
    "Woven": [",", ",", ",", ",", "E,1", "A,3", "E,2", "A,4", "E,3", "A,1", "E,4", "A,2", ",", "A,1", "D,3", "A,2", "D,4", "A,3", "D,1", "A,4", "D,2", ",", "D,1", "G,3", "D,2", "G,4", "D,3", "G,1", "D,4", "G,2", ",", "G,1", "B,3", "G,2", "B,4", "G,3", "B,1", "G,4", "B,2", ",", "B,1", "e,3", "B,2", "e,4", "B,3", "e,1", "B,4", "e,2", ",", ",", "e,2", "B,4", "e,1", "B,3", "e,4", "B,2", "e,3", "B,1", ",", "B,2", "G,4", "B,1", "G,3", "B,4", "G,2", "B,3", "G,1", ",", "G,2", "D,4", "G,1", "D,3", "G,4", "D,2", "G,3", "D,1", ",", "D,2", "A,4", "D,1", "A,3", "D,4", "A,2", "D,3", "A,1", ",", "A,2", "E,4", "A,1", "E,3", "A,4", "E,2", "A,3", "E,1", ",", ",", ","],
    "Woven Stretch": [",", ",", ",", ",", "E,1", "A,3", "E,2", "A,4", "E,3", "A,1", "E,4", "A,2", "E,1", "D,3", "E,2", "D,4", "E,3", "D,1", "E,4", "D,2", "E,1", "G,3", "E,2", "G,4", "E,3", "G,1", "E,4", "G,2", "E,1", "B,3", "E,2", "B,4", "E,3", "B,1", "E,4", "B,2", "E,1", "e,3", "E,2", "e,4", "E,3", "e,1", "E,4", "e,2", ",", ",", ","],
    "Woven Spaced": [",", ",", ",", ",", "E,1", "D,3", "E,2", "D,4", "E,3", "D,1", "E,4", "D,2", ",", "A,1", "G,3", "A,2", "G,4", "A,3", "G,1", "A,4", "G,2", ",", "D,1", "B,3", "D,2", "B,4", "D,3", "B,1", "D,4", "B,2", ",", "G,1", "e,3", "G,2", "e,4", "G,3", "e,1", "G,4", "e,2", ",", ",", ","],
    "13 24 Wave": [",", ",", ",", ",", "E,1", "E,3", "A,2", "A,4", "D,1", "D,3", "G,2", "G,4", "B,1", "B,3", "e,1", "e,4", ",", "e,1", "e,3", "B,2", "B,4", "G,1", "G,3", "D,2", "D,4", "A,1", "A,3", "E,2", "E,4", ",", ",", "E,2", "E,4", "A,3", "A,5", "D,2", "D,4", "G,3", "G,5", "B,2", "B,4", "e,2", "e,5", ",", "e,2", "e,4", "B,3", "B,5", "G,2", "G,4", "D,3", "D,5", "A,2", "A,4", "E,3", "E,5", ",", ",", "E,3", "E,5", "A,4", "A,6", "D,3", "D,5", "G,4", "G,6", "B,3", "B,5", "e,3", "e,6", ",", "e,3", "e,5", "B,4", "B,6", "G,3", "G,5", "D,4", "D,6", "A,3", "A,5", "E,4", "E,6", ",", ",", "E,4", "E,6", "A,5", "A,7", "D,4", "D,6", "G,5", "G,7", "B,4", "B,6", "e,4", "e,7", ",", "e,4", "e,6", "B,5", "B,7", "G,4", "G,6", "D,5", "D,7", "A,4", "A,6", "E,5", "E,7", ",", ",", "E,5", "E,7", "A,6", "A,8", "D,5", "D,7", "G,6", "G,8", "B,5", "B,7", "e,5", "e,8", ",", "e,5", "e,7", "B,6", "B,8", "G,5", "G,7", "D,6", "D,8", "A,5", "A,7", "E,6", "E,8", ",", ",", ","],
    "13 Spaced": [",", ",", ",", ",", "E,1", "E,3", "D,3", "D,1", "A,1", "A,3", "G,3", "G,1", "D,1", "D,3", "B,3", "B,1", "G,1", "G,3", "e,3", "e,1", "e,1", "e,3", "G,3", "G,1", "B,1", "B,3", "D,3", "D,1", "G,1", "G,3", "A,3", "A,1", "D,1", "D,3", "E,3", "E,1", ",", ",", ","],
    "Triangle": [",", ",", ",", ",", "E,1", "A,2", "D,3", "G,4", "G,4", "D,2", "A,3", "E,4", "A,1", "D,2", "G,3", "B,4", "B,1", "G,2", "D,3", "A,4", "D,1", "G,2", "B,3", "e,4", "e,1", "B,2", "G,3", "D,4", "D,1", "G,2", "B,3", "e,4", "e,1", "B,2", "G,3", "D,4", "A,1", "D,2", "G,3", "B,4", "B,1", "G,2", "D,3", "A,4", "E,1", "A,2", "D,3", "G,4", "G,1", "D,2", "A,3", "E,4", ",", ",", ","],
    "Diagonal Asc": [",", ",", ",", ",", "E,1", "A,2", "D,3", "G,4", "A,1", "D,2", "G,3", "B,4", "D,1", "G,2", "B,3", "e,4", "e,1", "B,2", "G,3", "D,4", "B,1", "G,2", "D,3", "A,4", "G,1", "D,2", "A,3", "E,4", ",", ",", ","],
    "Diagonal Desc": [",", ",", ",", ",", "E,4", "A,3", "D,2", "G,1", "A,4", "D,3", "G,2", "B,1", "D,4", "G,3", "B,2", "e,1", "e,4", "B,3", "G,2", "D,1", "B,4", "G,3", "D,2", "A,1", "G,4", "D,3", "A,2", "E,1", ",", ",", ","],
    "143 Stretch": [",", ",", ",", ",", "E,1", "e,4", "e,1", "E,4", "A,1", "B,4", "B,1", "A,3", "D,1", "G,3", "G,1", "D,3", "A,1", "B,4", "B,1", "A,3", ",", ",", ","],
    "Mini Wave": [",", ",", ",", ",", "E,1", "E,2", "E,3", "E,4", "A,1", "E,2", "E,3", "E,4", "A,1", "A,2", "E,3", "E,4", "A,1", "A,2", "A,3", "E,4", "A,1", "A,2", "A,3", "A,4", "D,1", "A,2", "A,3", "A,4", "D,1", "D,2", "A,3", "A,4", "D,1", "D,2", "D,3", "A,4", "D,1", "D,2", "D,3", "D,4", "G,1", "D,2", "D,3", "D,4", "G,1", "G,2", "D,3", "D,4", "G,1", "G,2", "G,3", "D,4", "G,1", "G,2", "G,3", "G,4", "B,1", "G,2", "G,3", "G,4", "B,1", "B,2", "G,3", "G,4", "B,1", "B,2", "B,3", "G,4", "B,1", "B,2", "B,3", "B,4", "e,1", "B,2", "B,3", "B,4", "e,1", "e,2", "B,3", "B,4", "e,1", "e,2", "e,3", "B,4", "e,1", "e,2", "e,3", "e,4", ",", ",", "e,4", "e,3", "e,2", "e,1", "B,4", "e,3", "e,2", "e,1", "B,4", "B,3", "e,2", "e,1", "B,4", "B,3", "B,2", "B,1", "e,1", "B,4", "B,3", "B,2", "B,1", "G,4", "B,3", "B,2", "B,1", "G,4", "G,3", "B,2", "B,1", "G,4", "G,3", "G,2", "B,1", "G,4", "G,3", "G,2", "G,1", "D,4", "G,3", "G,2", "G,1", "D,4", "D,3", "G,2", "G,1", "D,4", "D,3", "D,2", "G,1", "D,4", "D,3", "D,2", "D,1", "A,4", "D,3", "D,2", "D,1", "A,4", "A,3", "D,2", "D,1", "A,4", "A,3", "A,2", "D,1", "A,4", "A,3", "A,2", "A,1", "E,4", "A,3", "A,2", "A,1", "E,4", "E,3", "A,2", "A,1", "E,4", "E,3", "E,2", "A,1", "E,4", "E,3", "E,2", "E,1", ",", ",", ","],
    "Finger Pulse": [",", ",", ",", ",", "E,1", "E,2", "E,3", "E,4", "A,1", "E,2", "E,3", "E,4", "E,1", "A,2", "E,3", "E,4", "E,1", "E,2", "A,3", "E,4", "E,1", "E,2", "E,3", "A,4", "A,1", "A,2", "A,3", "A,4", "D,1", "A,2", "A,3", "A,4", "A,1", "D,2", "A,3", "A,4", "A,1", "A,2", "D,3", "A,4", "A,1", "A,2", "A,3", "D,4", "D,1", "D,2", "D,3", "D,4", "G,1", "D,2", "D,3", "D,4", "D,1", "G,2", "D,3", "D,4", "D,1", "D,2", "G,3", "D,4", "D,2", "D,2", "D,3", "G,4", "G,1", "G,2", "G,3", "G,4", "B,1", "G,2", "G,3", "G,4", "G,1", "B,2", "G,3", "G,4", "G,1", "G,2", "B,3", "G,4", "G,1", "G,2", "G,3", "B,4", "B,1", "B,2", "B,3", "B,4", "e,1", "B,2", "B,3", "B,4", "B,1", "e,2", "B,3", "B,4", "B,1", "B,2", "e,3", "B,4", "B,1", "B,2", "B,3", "e,4", "e,1", "e,2", "e,3", "e,4", ",", ",", ",", "e,4", "e,3", "e,2", "e,1", "B,4", "e,3", "e,2", "e,1", "e,4", "B,3", "e,2", "e,1", "e,4", "e,3", "B,2", "e,1", "e,4", "e,3", "e,2", "B,1", "B,4", "B,3", "B,2", "B,1", "G,4", "B,3", "B,2", "B,1", "B,4", "G,3", "B,2", "B,1", "B,4", "B,3", "G,2", "B,1", "B,4", "B,3", "B,2", "G,1", "G,4", "G,3", "G,2", "G,1", "D,4", "G,3", "G,2", "G,1", "G,4", "D,3", "G,2", "G,1", "G,4", "G,3", "D,2", "G,1", "G,4", "G,3", "G,2", "D,1", "D,4", "D,3", "D,2", "D,1", "A,4", "D,3", "D,2", "D,1", "D,4", "A,3", "D,2", "D,1", "D,4", "D,3", "A,2", "D,1", "D,4", "D,3", "D,2", "A,1", "A,4", "A,3", "A,2", "A,1", "E,4", "A,3", "A,2", "A,1", "A,4", "E,3", "A,2", "A,1", "A,4", "A,3", "E,2", "A,1", "A,4", "A,3", "A,2", "E,1", "E,4", "E,3", "E,2", "E,1", ",", ",", ","]
};

const CHORD_IMAGE_MAP = {
    'A': 'practice/<mode>/A.png',
    'Am': 'practice/<mode>/Am.png',
    'C': 'practice/<mode>/C.png',
    'D': 'practice/<mode>/D.png',
    'Dm': 'practice/<mode>/Dm.png',
    'E': 'practice/<mode>/E.png',
    'Em': 'practice/<mode>/Em.png',
    'F': 'practice/<mode>/F.png',
    'G': 'practice/<mode>/G.png'
};

// Global state
let exerciseList = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    populateSelects();
    loadExerciseList();
    setupEventListeners();
    setupQueueUI();
});

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.src = savedTheme === 'dark' ? 'sun.svg' : 'moon.svg';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.src = newTheme === 'dark' ? 'sun.svg' : 'moon.svg';
        localStorage.setItem('theme', newTheme);
    });
}

// Populate all select elements
function populateSelects() {
    // Spider Walk select
    const spiderSelect = document.getElementById('spiderWalkSelect');
    Object.keys(SPIDER_WALK_MAP).forEach(key => {
        const option = new Option(key, key);
        spiderSelect.add(option);
    });

    // Chord selects
    const chordOptions = Object.keys(CHORD_IMAGE_MAP);
    
    // From/To selects
    populateChordSelect('chordFromSelect', chordOptions, false);
    populateChordSelect('chordToSelect', chordOptions, true);
    
    // Random chords select
    populateChordSelect('randomChordsSelect', chordOptions, true);
    
    // Strumming chords select
    populateChordSelect('strummingChordsSelect', chordOptions, true);
}

function populateChordSelect(id, options, multiple) {
    const select = document.getElementById(id);
    options.forEach(chord => {
        const option = new Option(chord, chord);
        select.add(option);
    });
}

// Load saved exercise list
function loadExerciseList() {
    // Try to load from different storage options
    const sessionList = JSON.parse(sessionStorage.getItem('exerciseList') || '[]');
    const localList = JSON.parse(localStorage.getItem('exerciseList') || '[]');
    const cookieList = getCookieList();

    // Use the most recent list (the one with most items)
    exerciseList = [sessionList, localList, cookieList]
        .reduce((a, b) => a.length > b.length ? a : b, []);

    // Render the queue
    renderQueue();
}

function getCookieList() {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('exerciseList='));
    
    return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : [];
}

// Save exercise list to all storage types
function saveExerciseList() {
    const exerciseListJson = JSON.stringify(exerciseList);
    
    // Save to sessionStorage
    sessionStorage.setItem('exerciseList', exerciseListJson);
    
    // Save to localStorage
    localStorage.setItem('exerciseList', exerciseListJson);
    
    // Save to cookies (1 day expiry)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.cookie = `exerciseList=${encodeURIComponent(exerciseListJson)};expires=${tomorrow.toUTCString()};path=/`;
}

// Setup Queue UI interactions
function setupQueueUI() {
    const queueBubble = document.getElementById('queueBubble');
    const queueModal = document.getElementById('queueModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const floatingOpenPractice = document.getElementById('floatingOpenPractice');

    // Show/hide modal
    queueBubble.addEventListener('click', () => {
        queueModal.classList.remove('hidden');
        floatingOpenPractice.classList.add('hidden');
    });

    // Close modal on overlay click
    modalOverlay.addEventListener('click', () => {
        queueModal.classList.add('hidden');
        floatingOpenPractice.classList.remove('hidden');
    });

    // Close modal on close button click
    closeBtn.addEventListener('click', () => {
        queueModal.classList.add('hidden');
        floatingOpenPractice.classList.remove('hidden');
    });

    // Update bubble count
    updateQueueCount();
}

// Update the queue count in the bubble
function updateQueueCount() {
    const queueBubble = document.getElementById('queueBubble');
    queueBubble.textContent = exerciseList.length;
    
    // Hide bubble if queue is empty, show if not
    if (exerciseList.length === 0) {
        queueBubble.style.display = 'none';
    } else {
        queueBubble.style.display = 'flex';
    }
}

// Update the queue modal title with total duration
function updateQueueTitle() {
    const queueModalTitle = document.querySelector('#queueModal h2');
    if (!queueModalTitle) return;
    
    // Calculate total duration
    const totalMinutes = exerciseList.reduce((total, exercise) => {
        return total + parseInt(exercise.duration);
    }, 0);
    
    // Update title text
    if (totalMinutes > 0) {
        queueModalTitle.textContent = `Practice Queue (Total: ${totalMinutes} minutes)`;
    } else {
        queueModalTitle.textContent = 'Practice Queue';
    }
}

// Setup strumming pattern toggle buttons
function setupStrummingToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-strum');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            button.classList.toggle('active');
        });
    });
}

// Setup event listeners for all exercise cards
function setupEventListeners() {
    // Add exercise buttons
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.exercise-card');
            const type = parseInt(card.dataset.type);
            addExercise(type, card);
        });
    });

    // Setup strumming pattern toggle buttons
    setupStrummingToggles();

    // Start practice buttons (both modal and floating)
    [document.getElementById('startPractice'), document.getElementById('floatingOpenPractice')].forEach(button => {
        button.addEventListener('click', () => {
            if (exerciseList.length === 0) {
                alert('Add at least one exercise to the queue.');
                return;
            }
            window.location.href = 'execution.html';
        });
    });
}

// Add exercise to the queue
function addExercise(type, card) {
    let exercise;
    
    switch (type) {
        case 1: // Spider Walk
            exercise = createSpiderWalkExercise(card);
            break;
        case 2: // Chord Changes From/To
            exercise = createChordFromToExercise(card);
            break;
        case 3: // Random Chord Changes
            exercise = createRandomChordExercise(card);
            break;
        case 4: // Strumming
            exercise = createStrummingExercise(card);
            break;
    }

    if (exercise) {
        exerciseList.push(exercise);
        saveExerciseList();
        renderQueue();
    }
}

// Create exercise objects
function createSpiderWalkExercise(card) {
    const select = card.querySelector('select');
    const duration = card.querySelector('.duration-input').value;
    
    // Spider Walk doesn't need validation as fields have default values
    if (!select.value) {
        alert('Please select a spider walk pattern');
        return null;
    }

    return {
        type: 1,
        name: select.value,
        duration: parseInt(duration),
        spiderMap: SPIDER_WALK_MAP[select.value]
    };
}

function createChordFromToExercise(card) {
    const fromSelect = document.getElementById('chordFromSelect');
    const toSelect = document.getElementById('chordToSelect');
    const duration = card.querySelector('.duration-input').value;
    
    const selectedTo = Array.from(toSelect.selectedOptions).map(opt => opt.value);
    
    // Validate "From" chord selection
    if (!fromSelect.value) {
        alert('Select a base/anchor chord');
        return null;
    }
    
    // Validate "To" chord selection
    if (selectedTo.length === 0) {
        alert('Select at least one Chord target field');
        return null;
    }

    return {
        type: 2,
        name: `Chord Changes From ${fromSelect.value} to ${selectedTo.join(",")}`,
        chordFrom: fromSelect.value,
        chordsTo: selectedTo,
        duration: parseInt(duration)
    };
}

function createRandomChordExercise(card) {
    const select = document.getElementById('randomChordsSelect');
    const duration = card.querySelector('.duration-input').value;
    
    const selectedChords = Array.from(select.selectedOptions).map(opt => opt.value);
    
    // Validate that at least 4 chords are selected
    if (selectedChords.length < 4) {
        alert('For Random chord changes, select at least 4 chords');
        return null;
    }

    return {
        type: 3,
        name: `Chord Changes Random to ${selectedChords.join(",")}`,
        chordsTo: selectedChords,
        duration: parseInt(duration)
    };
}

function createStrummingExercise(card) {
    const select = document.getElementById('strummingChordsSelect');
    const duration = card.querySelector('.duration-input').value;
    const toggleButtons = card.querySelectorAll('.toggle-strum');
    
    // Create pattern array from toggle button states
    const pattern = Array.from(toggleButtons).map(btn => 
        btn.classList.contains('active') ? 1 : 0
    );
    
    const selectedChords = Array.from(select.selectedOptions).map(opt => opt.value);
    
    // Validate chord selection
    if (selectedChords.length === 0) {
        alert('Select at least one chord from the list');
        return null;
    }
    
    // Validate strum pattern selection
    if (!pattern.some(p => p === 1)) {
        alert('Select at least one strum');
        return null;
    }

    const patternName = pattern.map((v, i) => 
        v === 0 ? "-" : (i % 2 === 0 ? "D" : "U")
    ).join("");

    return {
        type: 4,
        name: "Strum " + patternName,
        duration: parseInt(duration),
        pattern: pattern,
        chords: selectedChords
    };
}

// Render the queue
function renderQueue() {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = '';
    updateQueueCount(); // Update the bubble count
    updateQueueTitle(); // Update the modal title with total duration

    exerciseList.forEach((exercise, index) => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.setAttribute('data-index', index);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'exercise-text';
        nameSpan.textContent = `${exercise.name} (${exercise.duration}min)`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.setAttribute('aria-label', 'Remove exercise');
        removeBtn.onclick = () => removeQueueItem(index);

        item.appendChild(nameSpan);
        item.appendChild(removeBtn);
        queueList.appendChild(item);
    });
}

// Remove exercise from queue with animation
function removeQueueItem(index) {
    const item = document.querySelector(`.queue-item[data-index="${index}"]`);
    if (!item) return;

    // Add removing animation
    item.classList.add('removing');
    
    // Wait for animation to complete before removing
    setTimeout(() => {
        // Remove from exercise list
        exerciseList.splice(index, 1);
        
        // Save updated list
        saveExerciseList();
        
        // Re-render queue to update indices
        renderQueue();
    }, 300); // Match the CSS transition duration
}

// Update queue indices after removal (called by renderQueue)
function updateQueueIndices() {
    const items = document.querySelectorAll('.queue-item');
    items.forEach((item, i) => {
        item.setAttribute('data-index', i);
        const removeBtn = item.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.onclick = () => removeQueueItem(i);
        }
    });
}
