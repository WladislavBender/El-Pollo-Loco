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
let gamePaused = false; // Status für Pause

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

/**
 * 🔄 Restart-Funktion
 * Lädt die Seite komplett neu -> zurück zum Startbildschirm
 */
function restartGame() {
    location.reload();
}

function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

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
    content.requestFullscreen().catch(err => console.error(`Fullscreen-Fehler: ${err.message}`));
    if (title) title.style.display = "none";
}

document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!isFullscreen() && title) showTitle(title);
});

function showTitle(title) {
    title.style.display = "block";
}

function startGame() {
    const startScreen = document.getElementById("start-screen");
    initLevel();
    init();
    fadeOutStartScreen(startScreen);
    gameStarted = true;

    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blockiert:", err));
    }
}

function fadeOutStartScreen(startScreen) {
    startScreen.classList.add("fade-out");
    setTimeout(() => startScreen.remove(), 1000);
}

// --- Musiksteuerung ---
function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function pauseMusic() {
    backgroundMusic.pause();
}

function resumeMusic() {
    if (soundEnabled && gameStarted && backgroundMusic.paused) {
        backgroundMusic.play().catch(err => console.log("Autoplay blockiert:", err));
    }
}

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

// --- Hit-Sound ---
function playHitSound() {
    if (soundEnabled) {
        let sfx = hitSound.cloneNode();
        sfx.volume = hitSound.volume;
        sfx.play().catch(err => console.log("Hit-Sound blockiert:", err));
    }
}

// --- Pause / Resume ---
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

// ESC als Pause-Taste
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        togglePause();
    }
});

// --- Events ---
window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));
window.addEventListener("beforeunload", () => stopMusic());
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseMusic();
    } else {
        resumeMusic();
    }
});

function detectDevice() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return (isMobileUA || isTouch);
}

window.addEventListener("load", () => {
    const mobileControls = document.getElementById("mobile-controls");
    if (detectDevice()) {
        console.log("📱 Mobile erkannt");
        mobileControls.classList.remove("hidden");
        bindMobileControls();
    } else {
        console.log("💻 Desktop erkannt");
        mobileControls.classList.add("hidden");
    }
});

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

function handleOrientation() {
    const isMobile = detectDevice();
    const overlay = document.getElementById("rotate-overlay");

    if (isMobile) {
        if (window.matchMedia("(orientation: landscape)").matches) {
            overlay.classList.add("hidden");
        } else {
            overlay.classList.remove("hidden");
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err =>
                    console.error("Fullscreen konnte nicht verlassen werden:", err)
                );
            }
        }
    } else {
        overlay.classList.add("hidden");
    }
}

window.addEventListener("orientationchange", handleOrientation);
window.addEventListener("resize", handleOrientation);
window.addEventListener("load", handleOrientation);
