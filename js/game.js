let canvas;
let world;
let keyboard = new Keyboard();

let backgroundMusic = new Audio("audio/background_music.mp3");
backgroundMusic.loop = true;

let hitSound = new Audio("audio/hit_sound.m4a");
let winSound = new Audio("audio/win_sound.mp3");
let failSound = new Audio("audio/fail_sound.mp3");

let soundEnabled = localStorage.getItem("soundEnabled") === null
    ? true
    : localStorage.getItem("soundEnabled") === "true";

let gameStarted = false;
let gamePaused = false;
let lastOverlay = null;

let gameVolume = localStorage.getItem("gameVolume") !== null
    ? parseFloat(localStorage.getItem("gameVolume"))
    : 0.5;

applyVolume();


/**
 * Initializes the canvas and game world.
 * @function
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

/**
 * Restarts the game and resets state.
 * @function
 * @returns {void}
 */
function restartGame() {
    stopMusic();
    clearCanvas();
    initLevel();
    init();
    resetGameState();
    startBackgroundMusic();
    hideEndScreen();
    hidePauseOverlay();
    resetPauseButton();
    showMobileControls();
}

/**
 * Clears the game canvas.
 * @function
 * @returns {void}
 */
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Resets game state flags.
 * @function
 * @returns {void}
 */
function resetGameState() {
    gameStarted = true;
    gamePaused = false;
}

/**
 * Hides the pause overlay.
 * @function
 * @returns {void}
 */
function hidePauseOverlay() {
    const pauseOverlay = document.getElementById("pause-overlay");
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
}

/**
 * Resets and shows the pause button.
 * @function
 * @returns {void}
 */
function resetPauseButton() {
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) {
        pauseBtn.innerText = "⏸";
        pauseBtn.classList.remove("hidden");
    }
}

/**
 * Shows mobile controls if device is detected as mobile.
 * @function
 * @returns {void}
 */
function showMobileControls() {
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice() && mobileControls) {
        mobileControls.classList.remove("hidden");
    }
}

/**
 * Stops background music completely.
 * @function
 * @returns {void}
 */
function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/**
 * Pauses background music.
 * @function
 * @returns {void}
 */
function pauseMusic() {
    backgroundMusic.pause();
}

/**
 * Resumes background music if enabled.
 * @function
 * @returns {void}
 */
function resumeMusic() {
    if (soundEnabled && gameStarted && backgroundMusic.paused) {
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/**
 * Starts background music from the beginning.
 * @function
 * @returns {void}
 */
function startBackgroundMusic() {
    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/**
 * Toggles sound on/off and saves preference.
 * @function
 * @returns {void}
 */
function toggleSound() {
    const btn = document.getElementById("sound-btn");
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);
    updateSoundButton(btn);
}

/**
 * Updates sound button appearance.
 * @function
 * @param {HTMLElement} btn - The button element used to toggle sound.
 * @returns {void}
 */
function updateSoundButton(btn) {
    if (soundEnabled) {
        btn.textContent = "🔊";
        if (gameStarted) resumeMusic();
    } else {
        btn.textContent = "🔇";
        pauseMusic();
    }
}

/**
 * Plays hit sound effect.
 * @function
 * @returns {void}
 */
function playHitSound() {
    if (soundEnabled && (hitSound.paused || hitSound.ended)) {
        hitSound.currentTime = 0;
        hitSound.play().catch(err => console.log("Hit sound blocked:", err));
    }
}

/**
 * Hides the end screen overlay.
 * @function
 * @returns {void}
 */
function hideEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("show");
    endScreen.classList.add("hidden");
}

/**
 * Shows the end screen overlay.
 * @function
 * @returns {void}
 */
function showEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("hidden");
    endScreen.classList.add("show");
    stopMusic();
}

/**
 * Starts the game and shows world.
 * @function
 * @returns {void}
 */
function startGame() {
    const startScreen = document.getElementById("start-screen");
    initLevel();
    init();
    gameStarted = true;
    startBackgroundMusic();
    showPauseButton();
    fadeOutStartScreen(startScreen, showMobileControls);
}

/**
 * Displays the pause button.
 * @function
 * @returns {void}
 */
function showPauseButton() {
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) pauseBtn.classList.remove("hidden");
}

/**
 * Fades out start screen.
 * @function
 * @param {HTMLElement} startScreen - Start screen element.
 * @param {Function} onDone - Callback after removal.
 * @returns {void}
 */
function fadeOutStartScreen(startScreen, onDone) {
    startScreen.classList.add("fade-out");
    setTimeout(() => {
        startScreen.remove();
        if (typeof onDone === 'function') onDone();
    }, 1000);
}

/**
 * Toggles fullscreen mode.
 * @function
 * @returns {void}
 */
function toggleFullscreen() {
    const content = document.getElementById("content");
    const title = document.querySelector("#content h1");
    if (isFullscreen()) {
        document.exitFullscreen();
    } else {
        enterFullscreen(content, title);
    }
}

/**
 * Checks if fullscreen mode is active.
 * @function
 * @returns {boolean} True if fullscreen is active.
 */
function isFullscreen() {
    return document.fullscreenElement;
}

/**
 * Enters fullscreen mode.
 * @function
 * @param {HTMLElement} content - Game container element.
 * @param {HTMLElement} title - Title element.
 * @returns {void}
 */
function enterFullscreen(content, title) {
    content.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    if (title) title.style.display = "none";
}

/**
 * Shows the title element.
 * @function
 * @param {HTMLElement} title - Title element.
 * @returns {void}
 */
function showTitle(title) {
    title.style.display = "block";
}

document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!isFullscreen() && title) showTitle(title);
});

/**
 * Updates pause button appearance.
 * @function
 * @returns {void}
 */
function updatePauseButton() {
    const btn = document.getElementById("pause-btn");
    btn.innerText = gamePaused ? "▶️" : "⏸";
}

/**
 * Pauses the game.
 * @function
 * @returns {void}
 */
function pauseGame() {
    if (world && !gamePaused) {
        gamePaused = true;
        world.pause();
        pauseMusic();
        document.getElementById("pause-overlay").classList.remove("hidden");
        updatePauseButton();
    }
}

/**
 * Resumes the game.
 * @function
 * @returns {void}
 */
function resumeGame() {
    if (world && gamePaused) {
        gamePaused = false;
        world.resume();
        resumeMusic();
        document.getElementById("pause-overlay").classList.add("hidden");
        updatePauseButton();
    }
}

/**
 * Toggles between pause and resume.
 * @function
 * @returns {void}
 */
function togglePause() {
    if (gamePaused) resumeGame();
    else pauseGame();
}

