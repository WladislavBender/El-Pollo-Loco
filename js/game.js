let canvas;
let world;
let keyboard = new Keyboard();

let backgroundMusic = new Audio("audio/background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.05;

let hitSound = new Audio("audio/hit_sound.m4a");
hitSound.volume = 0.3;

let winSound = new Audio("audio/win_sound.mp3");
winSound.volume = 0.05;

let failSound = new Audio("audio/fail_sound.mp3");
failSound.volume = 0.05;

let soundEnabled = localStorage.getItem("soundEnabled") === null
    ? true
    : localStorage.getItem("soundEnabled") === "true";

let gameStarted = false;
let gamePaused = false;

/** Initializes the canvas and game world */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

/** Restarts the game */
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

/** Clears the game canvas */
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/** Resets game state flags */
function resetGameState() {
    gameStarted = true;
    gamePaused = false;
}

/** Hides the pause overlay */
function hidePauseOverlay() {
    const pauseOverlay = document.getElementById("pause-overlay");
    if (pauseOverlay) pauseOverlay.classList.add("hidden");
}

/** Resets and shows the pause button */
function resetPauseButton() {
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) {
        pauseBtn.innerText = "⏸";
        pauseBtn.classList.remove("hidden");
    }
}

/** Shows mobile controls if device is detected as mobile */
function showMobileControls() {
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice() && mobileControls) {
        mobileControls.classList.remove("hidden");
    }
}

/** Stops background music */
function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/** Pauses background music */
function pauseMusic() {
    backgroundMusic.pause();
}

/** Resumes background music if enabled */
function resumeMusic() {
    if (soundEnabled && gameStarted && backgroundMusic.paused) {
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/** Starts background music from the beginning */
function startBackgroundMusic() {
    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

/** Toggles sound on/off and saves preference */
function toggleSound() {
    const btn = document.getElementById("sound-btn");
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled);
    updateSoundButton(btn);
}

/**
 * Updates sound button appearance
 * @param {HTMLElement} btn - Sound toggle button
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

/** Plays hit sound effect */
function playHitSound() {
    if (soundEnabled) {
        let sfx = hitSound.cloneNode();
        sfx.volume = hitSound.volume;
        sfx.play().catch(err => console.log("Hit sound blocked:", err));
    }
}

/** Hides the end screen */
function hideEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("show");
    endScreen.classList.add("hidden");
}

/** Shows the end screen */
function showEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("hidden");
    endScreen.classList.add("show");
    stopMusic();
}

/** Starts the game */
function startGame() {
    const startScreen = document.getElementById("start-screen");
    initLevel();
    init();
    gameStarted = true;
    startBackgroundMusic();
    showPauseButton();
    fadeOutStartScreen(startScreen, showMobileControls);
}

/** Displays the pause button */
function showPauseButton() {
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) pauseBtn.classList.remove("hidden");
}

/**
 * Fades out start screen
 * @param {HTMLElement} startScreen - Start screen element
 * @param {Function} onDone - Callback after removal
 */
function fadeOutStartScreen(startScreen, onDone) {
    startScreen.classList.add("fade-out");
    setTimeout(() => {
        startScreen.remove();
        if (typeof onDone === 'function') onDone();
    }, 1000);
}

/** Toggles fullscreen mode */
function toggleFullscreen() {
    const content = document.getElementById("content");
    const title = document.querySelector("#content h1");
    if (isFullscreen()) {
        document.exitFullscreen();
    } else {
        enterFullscreen(content, title);
    }
}

/** Checks if fullscreen mode is active */
function isFullscreen() {
    return document.fullscreenElement;
}

/**
 * Enters fullscreen mode
 * @param {HTMLElement} content - Game container element
 * @param {HTMLElement} title - Title element
 */
function enterFullscreen(content, title) {
    content.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    if (title) title.style.display = "none";
}

/**
 * Shows the title element
 * @param {HTMLElement} title - Title element
 */
function showTitle(title) {
    title.style.display = "block";
}

document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!isFullscreen() && title) showTitle(title);
});

/** Updates pause button appearance */
function updatePauseButton() {
    const btn = document.getElementById("pause-btn");
    btn.innerText = gamePaused ? "▶️" : "⏸";
}

/** Pauses the game */
function pauseGame() {
    if (world && !gamePaused) {
        gamePaused = true;
        world.pause();
        pauseMusic();
        document.getElementById("pause-overlay").classList.remove("hidden");
        updatePauseButton();
    }
}

/** Resumes the game */
function resumeGame() {
    if (world && gamePaused) {
        gamePaused = false;
        world.resume();
        resumeMusic();
        document.getElementById("pause-overlay").classList.add("hidden");
        updatePauseButton();
    }
}

/** Toggles between pause and resume */
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

/**
 * Handles key press/release
 * @param {KeyboardEvent} event 
 * @param {boolean} isPressed 
 */
function handleKey(event, isPressed) {
    if (gamePaused) return;
    if (isRight(event)) keyboard.RIGHT = isPressed;
    if (isLeft(event)) keyboard.LEFT = isPressed;
    if (isUp(event)) keyboard.UP = isPressed;
    if (isDown(event)) keyboard.DOWN = isPressed;
    if (isSpace(event)) keyboard.SPACE = isPressed;
    if (isThrow(event)) keyboard.D = isPressed;
}

function isRight(event) { return event.keyCode === 39; }
function isLeft(event) { return event.keyCode === 37; }
function isUp(event) { return event.keyCode === 38; }
function isDown(event) { return event.keyCode === 40; }
function isSpace(event) { return event.keyCode === 32; }
function isThrow(event) { return event.keyCode === 68; }

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

/** Detects if device is mobile */
function detectDevice() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return (isMobileUA || isTouch);
}

/** Binds mobile control buttons */
function bindMobileControls() {
    const controls = [
        { id: "btn-left", key: "LEFT" },
        { id: "btn-right", key: "RIGHT" },
        { id: "btn-jump", key: "SPACE" },
        { id: "btn-throw", key: "D" }
    ];
    controls.forEach(control => bindControl(control));
}

/**
 * Binds a single control button
 * @param {{id: string, key: string}} control 
 */
function bindControl(control) {
    const btn = document.getElementById(control.id);
    btn.addEventListener("touchstart", e => { e.preventDefault(); setKey(control.key, true); });
    btn.addEventListener("mousedown", e => { e.preventDefault(); setKey(control.key, true); });
    btn.addEventListener("touchend", e => { e.preventDefault(); setKey(control.key, false); });
    btn.addEventListener("mouseup", e => { e.preventDefault(); setKey(control.key, false); });
    btn.addEventListener("touchcancel", () => setKey(control.key, false));
    btn.addEventListener("mouseleave", () => setKey(control.key, false));
}

/**
 * Sets a keyboard key state
 * @param {string} key 
 * @param {boolean} isPressed 
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
    applyVolume();
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice()) {
        bindMobileControls();
        if (mobileControls) mobileControls.classList.add("hidden");
    } else {
        if (mobileControls) mobileControls.classList.add("hidden");
    }
    const btn = document.getElementById("sound-btn");
    if (btn) {
        btn.textContent = soundEnabled ? "🔊" : "🔇";
        if (!soundEnabled) pauseMusic();
    }
    handleOrientation();
});

/** Handles device orientation */
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

/** Exits fullscreen mode if active */
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

window.addEventListener("beforeunload", () => stopMusic());
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseMusic();
    } else {
        resumeMusic();
    }
});


let lastOverlay = null; // speichert, von wo Settings geöffnet wurde
let gameVolume = localStorage.getItem("gameVolume") !== null
    ? parseFloat(localStorage.getItem("gameVolume"))
    : 0.5;

/** Wendet die gespeicherte Lautstärke auf alle Sounds an */
function applyVolume() {
    backgroundMusic.volume = gameVolume;
    hitSound.volume = gameVolume * 0.6;
    winSound.volume = gameVolume;
    failSound.volume = gameVolume;
}

/** Öffnet das Settings-Overlay */
function openSettings(fromOverlayId) {
    lastOverlay = fromOverlayId;
    document.getElementById(fromOverlayId).classList.add("hidden");
    document.getElementById("settings-overlay").classList.remove("hidden");

    const slider = document.getElementById("volume-slider");
    slider.value = gameVolume;
    slider.addEventListener("input", (e) => {
        gameVolume = parseFloat(e.target.value);
        localStorage.setItem("gameVolume", gameVolume);
        applyVolume();
    });
}

/** Schließt Settings und kehrt zurück zum vorherigen Overlay */
function closeSettings() {
    document.getElementById("settings-overlay").classList.add("hidden");
    if (lastOverlay) {
        document.getElementById(lastOverlay).classList.remove("hidden");
    }
}

/** Zurück zum Startscreen */
function returnToMenu() {
    stopMusic();
    clearCanvas();
    gameStarted = false;
    gamePaused = false;

    // Overlays zurücksetzen
    document.getElementById("pause-overlay").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("pause-btn").classList.add("hidden");
    document.getElementById("mobile-controls").classList.add("hidden");

    // prüfen, ob Start-Screen schon existiert
    if (document.getElementById("start-screen")) return;

    // Startscreen neu erstellen
    const startScreen = document.createElement("div");
    startScreen.id = "start-screen";
    startScreen.innerHTML = `
        <div class="overlay-content">
            <button id="start-btn" onclick="startGame()">Start</button>
            <button id="start-btn" onclick="openSettings('start-screen')">Settings</button>
        </div>
    `;
    document.getElementById("content").appendChild(startScreen);
}

