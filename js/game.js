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


/* ==================== Sound Setting from LocalStorage ==================== */
window.addEventListener("load", () => {
    const savedSoundSetting = localStorage.getItem("soundEnabled");
    const btn = document.getElementById("sound-btn");
    if (savedSoundSetting !== null) {
        soundEnabled = JSON.parse(savedSoundSetting);
    }
    btn.textContent = soundEnabled ? "🔊" : "🔇";
    if (!soundEnabled) {
        pauseMusic();
    }

    // Mobile Controls initialisieren
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice()) {
        mobileControls.classList.remove("hidden");
        bindMobileControls();
    } else {
        mobileControls.classList.add("hidden");
    }

    handleOrientation();
});


/* ==================== Initialization ==================== */
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

function restartGame() {
    document.getElementById("pause-btn").classList.add("hidden");
    location.reload();
}

function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/* ==================== Screens ==================== */
function hideEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("show");
    endScreen.classList.add("hidden");
}

function showEndScreen() {
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("hidden");
    endScreen.classList.add("show");
    stopMusic();
}

function startGame() {
    const startScreen = document.getElementById("start-screen");
    initLevel();
    init();
    fadeOutStartScreen(startScreen);
    gameStarted = true;
    startBackgroundMusic();

    // Pause-Button einblenden
    document.getElementById("pause-btn").classList.remove("hidden");
}

function fadeOutStartScreen(startScreen) {
    startScreen.classList.add("fade-out");
    setTimeout(() => startScreen.remove(), 1000);
}


/* ==================== Fullscreen ==================== */
function toggleFullscreen() {
    const content = document.getElementById("content");
    const title = document.querySelector("#content h1");
    if (isFullscreen()) {
        document.exitFullscreen();
    } else {
        enterFullscreen(content, title);
    }
}

function isFullscreen() {
    return document.fullscreenElement;
}

function enterFullscreen(content, title) {
    content.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message}`));
    if (title) title.style.display = "none";
}

function showTitle(title) {
    title.style.display = "block";
}

document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!isFullscreen() && title) showTitle(title);
});


/* ==================== Music & Sound ==================== */
function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function pauseMusic() {
    backgroundMusic.pause();
}

function resumeMusic() {
    if (soundEnabled && gameStarted && backgroundMusic.paused) {
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

function startBackgroundMusic() {
    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blocked:", err));
    }
}

function toggleSound() {
    const btn = document.getElementById("sound-btn");
    soundEnabled = !soundEnabled;

    // Einstellung speichern
    localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled));

    if (soundEnabled) {
        btn.textContent = "🔊";
        if (gameStarted) resumeMusic();
    } else {
        btn.textContent = "🔇";
        pauseMusic();
    }
}

function playHitSound() {
    if (soundEnabled) {
        let sfx = hitSound.cloneNode();
        sfx.volume = hitSound.volume;
        sfx.play().catch(err => console.log("Hit sound blocked:", err));
    }
}


/* ==================== Pause / Resume ==================== */
function updatePauseButton() {
    const btn = document.getElementById("pause-btn");
    btn.innerText = gamePaused ? "▶️" : "⏸";
}

function pauseGame() {
    if (world && !gamePaused) {
        gamePaused = true;
        world.pause();
        pauseMusic();
        document.getElementById("pause-overlay").classList.remove("hidden");
        updatePauseButton();
    }
}

function resumeGame() {
    if (world && gamePaused) {
        gamePaused = false;
        world.resume();
        resumeMusic();
        document.getElementById("pause-overlay").classList.add("hidden");
        updatePauseButton();
    }
}

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
function handleKey(event, isPressed) {
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


/* ==================== Mobile Controls ==================== */
function detectDevice() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return (isMobileUA || isTouch);
}

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

function setKey(key, isPressed) {
    switch (key) {
        case 'LEFT': keyboard.LEFT = isPressed; break;
        case 'RIGHT': keyboard.RIGHT = isPressed; break;
        case 'SPACE': keyboard.SPACE = isPressed; break;
        case 'D': keyboard.D = isPressed; break;
    }
}


/* ==================== Orientation Handling ==================== */
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

function exitFullscreenIfActive() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err =>
            console.error("Could not exit fullscreen:", err)
        );
    }
}

window.addEventListener("orientationchange", handleOrientation);
window.addEventListener("resize", handleOrientation);


/* ==================== System Events ==================== */
window.addEventListener("beforeunload", () => stopMusic());

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseMusic();
    } else {
        resumeMusic();
    }
});
