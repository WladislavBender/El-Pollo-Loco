/* ==================== Global Variables ==================== */
let canvas;
let world;
let keyboard = new Keyboard();

let backgroundMusic = new Audio("audio/background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

let hitSound = new Audio("audio/hit_sound.m4a");
hitSound.volume = 0.7;

let winSound = new Audio("audio/win_sound.mp3");
winSound.volume = 0.3;

let failSound = new Audio("audio/fail_sound.mp3");
failSound.volume = 0.4;

let soundEnabled = true;
let gameStarted = false;
let gamePaused = false;


/* ==================== Initialization ==================== */
/**
 * Initialize the game world and canvas.
 */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

/**
 * Restart the game by reloading the page.
 */
function restartGame() {
    location.reload();
}

/**
 * Clear the canvas completely.
 */
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/* ==================== Screens ==================== */
/**
 * Hide the end screen.
 */
function hideEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("show");
    endScreen.classList.add("hidden");
}

/**
 * Show the end screen and stop music.
 */
function showEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("hidden");
    endScreen.classList.add("show");
    stopMusic();
}

/**
 * Start the game: initialize world, hide start screen, and play music.
 */
function startGame() {
    const startScreen = document.getElementById("start-screen");
    initLevel();
    init();
    fadeOutStartScreen(startScreen);
    gameStarted = true;
    startBackgroundMusic();
}

/**
 * Fade out the start screen smoothly.
 * @param {HTMLElement} startScreen - The start screen element.
 */
function fadeOutStartScreen(startScreen) {
    startScreen.classList.add("fade-out");
    setTimeout(() => startScreen.remove(), 1000);
}


/* ==================== Fullscreen ==================== */
/**
 * Toggle fullscreen mode for the game.
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
 * Check if fullscreen is active.
 * @returns {boolean}
 */
function isFullscreen() {
    return document.fullscreenElement;
}

/**
 * Enter fullscreen mode and hide the title.
 * @param {HTMLElement} content - The content container.
 * @param {HTMLElement} title - The title element.
 */
function enterFullscreen(content, title) {
    content.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    if (title) title.style.display = "none";
}

/**
 * Show the title again after exiting fullscreen.
 * @param {HTMLElement} title - The title element.
 */
function showTitle(title) {
    title.style.display = "block";
}

document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!isFullscreen() && title) showTitle(title);
});


/* ==================== Music & Sound ==================== */
/**
 * Stop and reset background music.
 */
function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/**
 * Pause background music.
 */
function pauseMusic() {
    backgroundMusic.pause();
}

/**
 * Resume background music if conditions are met.
 */
function resumeMusic() {
    if (soundEnabled && gameStarted && backgroundMusic.paused) {
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/**
 * Start background music from the beginning.
 */
function startBackgroundMusic() {
    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/**
 * Toggle sound on/off and update button.
 */
function toggleSound() {
    const btn = document.getElementById("sound-btn");
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        btn.textContent = "🔊";
        if (gameStarted) resumeMusic();
    } else {
        btn.textContent = "🔇";
        pauseMusic();
    }
}

/**
 * Play hit sound effect.
 */
function playHitSound() {
    if (soundEnabled) {
        let sfx = hitSound.cloneNode();
        sfx.volume = hitSound.volume;
        sfx.play().catch(err => console.log("Hit sound blocked:", err));
    }
}


/* ==================== Pause / Resume ==================== */
/**
 * Update the pause button icon.
 */
function updatePauseButton() {
    const btn = document.getElementById("pause-btn");
    btn.innerText = gamePaused ? "▶️" : "⏸";
}

/**
 * Pause the game: stop world and music, show overlay.
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
 * Resume the game: continue world and music, hide overlay.
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
 * Toggle pause state.
 */
function togglePause() {
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePause();
});


/* ==================== Input Handling ==================== */
/**
 * Handle key press or release events.
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {boolean} isPressed - True if key is pressed, false if released.
 */
function handleKey(event, isPressed) {
    if (isRight(event)) keyboard.RIGHT = isPressed;
    if (isLeft(event)) keyboard.LEFT = isPressed;
    if (isUp(event)) keyboard.UP = isPressed;
    if (isDown(event)) keyboard.DOWN = isPressed;
    if (isSpace(event)) keyboard.SPACE = isPressed;
    if (isThrow(event)) keyboard.D = isPressed;
}

/** @returns {boolean} */
function isRight(event) { return event.keyCode === 39; }
/** @returns {boolean} */
function isLeft(event) { return event.keyCode === 37; }
/** @returns {boolean} */
function isUp(event) { return event.keyCode === 38; }
/** @returns {boolean} */
function isDown(event) { return event.keyCode === 40; }
/** @returns {boolean} */
function isSpace(event) { return event.keyCode === 32; }
/** @returns {boolean} */
function isThrow(event) { return event.keyCode === 68; }

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));


/* ==================== Mobile Controls ==================== */
/**
 * Detect if the current device is mobile or touch-enabled.
 * @returns {boolean}
 */
function detectDevice() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return (isMobileUA || isTouch);
}

/**
 * Bind mobile control buttons to keyboard actions.
 */
function bindMobileControls() {
    const controls = [
        { id: "btn-left", key: "LEFT" },
        { id: "btn-right", key: "RIGHT" },
        { id: "btn-jump", key: "SPACE" },
        { id: "btn-throw", key: "D" }
    ];

    controls.forEach(control => {
        const btn = document.getElementById(control.id);
        btn.addEventListener("touchstart", (e) => { e.preventDefault(); setKey(control.key, true); });
        btn.addEventListener("mousedown", (e) => { e.preventDefault(); setKey(control.key, true); });
        btn.addEventListener("touchend", (e) => { e.preventDefault(); setKey(control.key, false); });
        btn.addEventListener("mouseup", (e) => { e.preventDefault(); setKey(control.key, false); });
        btn.addEventListener("touchcancel", () => setKey(control.key, false));
        btn.addEventListener("mouseleave", () => setKey(control.key, false));
    });
}

/**
 * Set keyboard state for mobile controls.
 * @param {string} key - The key name.
 * @param {boolean} isPressed - Pressed state.
 */
function setKey(key, isPressed) {
    switch (key) {
        case 'LEFT': keyboard.LEFT = isPressed; break;
        case 'RIGHT': keyboard.RIGHT = isPressed; break;
        case 'SPACE': keyboard.SPACE = isPressed; break;
        case 'D': keyboard.D = isPressed; break;
    }
}

window.addEventListener("load", () => {
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice()) {
        console.log("📱 Mobile detected");
        mobileControls.classList.remove("hidden");
        bindMobileControls();
    } else {
        console.log("💻 Desktop detected");
        mobileControls.classList.add("hidden");
    }
});


/* ==================== Orientation Handling ==================== */
/**
 * Handle orientation changes and show overlay if portrait mode on mobile.
 */
function handleOrientation() {
    const isMobile = detectDevice();
    const overlay = document.getElementById("rotate-overlay");

    if (isMobile) {
        if (window.matchMedia("(orientation: landscape)").matches) {
            overlay.classList.add("hidden");
        } else {
            overlay.classList.remove("hidden");
            exitFullscreenIfActive();
        }
    } else {
        overlay.classList.add("hidden");
    }
}

/**
 * Exit fullscreen if currently active.
 */
function exitFullscreenIfActive() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err =>
            console.error("Could not exit fullscreen:", err)
        );
    }
}

window.addEventListener("orientationchange", handleOrientation);
window.addEventListener("resize", handleOrientation);
window.addEventListener("load", handleOrientation);


/* ==================== System Events ==================== */
window.addEventListener("beforeunload", () => stopMusic());

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseMusic();
    } else {
        resumeMusic();
    }
});
