let canvas;
let world;
let keyboard = new Keyboard();
let backgroundMusic = new Audio("audio/background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

let hitSound = new Audio("audio/hit_sound.m4a");
hitSound.volume = 0.7;

let soundEnabled = true;
let gameStarted = false; // NEU: Spielstatus merken

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

function restartGame() {
    clearCanvas();
    initLevel();
    world = new World(canvas, keyboard);
    hideEndScreen();

    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blockiert:", err));
    }
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

    gameStarted = true; // ab jetzt darf Musik laufen

    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blockiert:", err));
    }
}

function fadeOutStartScreen(startScreen) {
    startScreen.classList.add("fade-out");
    setTimeout(() => startScreen.remove(), 1000);
}

// ----------------- Musik-Steuerung -----------------
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
        if (gameStarted) resumeMusic(); // Nur wenn Spiel läuft
    } else {
        btn.textContent = "🔇";
        pauseMusic();
    }
}

// ----------------- Hit-Sound Funktion -----------------
function playHitSound() {
    if (soundEnabled) {
        let sfx = hitSound.cloneNode(); // verhindert Überschneidungsfehler
        sfx.volume = hitSound.volume;
        sfx.play().catch(err => console.log("Hit-Sound blockiert:", err));
    }
}

// ----------------- Events -----------------
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
