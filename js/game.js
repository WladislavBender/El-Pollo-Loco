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
        // exit fullscreen
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
        // enter fullscreen (desktop button)
        if (content.requestFullscreen) content.requestFullscreen().catch(err => console.error(`Fullscreen-Fehler: ${err.message}`));
        else if (content.webkitRequestFullscreen) content.webkitRequestFullscreen();
        else if (content.msRequestFullscreen) content.msRequestFullscreen();
        if (title) title.style.display = "none";
    }
}

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}

function enterFullscreen(content, title) {
    if (!content) return;
    if (content.requestFullscreen) content.requestFullscreen().catch(err => console.error(`Fullscreen-Fehler: ${err.message}`));
    else if (content.webkitRequestFullscreen) content.webkitRequestFullscreen();
    else if (content.msRequestFullscreen) content.msRequestFullscreen();
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

    // 🎵 Musik starten (nur wenn erlaubt)
    if (soundEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(err => console.log("Autoplay blockiert:", err));
    }

    // 🎬 Versuch, Fullscreen zu aktivieren (funktioniert da startGame per Klick aufgerufen wird)
    // Wir verwenden tryEnterFullscreen(), das vendor prefixes berücksichtigt.
    if (isMobileDevice()) {
        tryEnterFullscreen().then(success => {
            if (!success) {
                // Falls Fullscreen nicht möglich: Fallback - remove scrolling (app-like)
                document.body.classList.add('no-scroll');
            }
        });
    } else {
        // Desktop: optional direkt Fullscreen (wenn der Nutzer möchte)
        // leave it to toggleFullscreen button
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

// ----------------- Mobile / Fullscreen / Controls (robust) ----------------

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);
}

function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

/* Fullscreen helper (vendor prefixes handled in tryEnterFullscreen) */
const FullscreenAPI = {
    isActive: () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
};

/* Versucht Fullscreen - darf nur durch User-Gesture aufgerufen werden */
async function tryEnterFullscreen() {
    const content = document.getElementById('content');
    if (!content) return false;

    const request = content.requestFullscreen || content.webkitRequestFullscreen || content.msRequestFullscreen;
    if (!request) {
        console.log("Fullscreen API wird auf diesem Gerät nicht unterstützt.");
        return false;
    }
    try {
        await request.call(content);
        return true;
    } catch (err) {
        console.log("Fullscreen konnte nicht aktiviert werden:", err);
        return false;
    }
}

/* FS-Prompt anzeigen und auf ersten Tap reagieren (trusted gesture) */
function showFullscreenPromptOnce() {
    const prompt = document.getElementById('fs-prompt');
    if (!prompt) return;

    // Falls bereits Fullscreen aktiv, nichts tun
    if (FullscreenAPI.isActive()) {
        prompt.classList.remove('visible');
        return;
    }

    prompt.classList.add('visible');

    async function handler(e) {
        if (e && e.preventDefault) e.preventDefault();
        prompt.classList.remove('visible');

        const success = await tryEnterFullscreen();
        if (!success) {
            // Fallback: wenn Fullscreen nicht unterstützt -> trotzdem scroll verhindern für app-like UX
            document.body.classList.add('no-scroll');
        }
        // nur einmal ausführen
        prompt.removeEventListener('pointerdown', handler);
        prompt.removeEventListener('touchstart', handler);
        document.removeEventListener('click', handler);
    }

    // unterstütze pointer / touch / click
    prompt.addEventListener('pointerdown', handler, { once: true });
    prompt.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true }); // fallback falls prompt nicht erreichbar
}

/* Mobile-Steuerelemente erstellen (pointer-events statt nur touch) */
function createMobileControls() {
    const container = document.getElementById("mobile-controls");
    if (!container) return;
    container.innerHTML = ""; // leeren

    const buttons = [
        { id: "btn-left", label: "Left", key: "LEFT" },
        { id: "btn-right", label: "Right", key: "RIGHT" },
        { id: "btn-jump", label: "Jump", key: "SPACE" },
        { id: "btn-throw", label: "Throw", key: "D" }
    ];

    buttons.forEach(({ id, label, key }) => {
        const btn = document.createElement("button");
        btn.id = id;
        btn.textContent = label;

        // pointer events (funktionieren für Touch & Mouse)
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            keyboard[key] = true;
        });
        btn.addEventListener("pointerup", e => {
            e.preventDefault();
            keyboard[key] = false;
        });
        btn.addEventListener("pointercancel", e => {
            keyboard[key] = false;
        });
        btn.addEventListener("pointerout", e => {
            keyboard[key] = false;
        });

        // fallback für Touch-Ende
        btn.addEventListener("touchend", e => {
            e.preventDefault();
            keyboard[key] = false;
        });

        container.appendChild(btn);
    });
}

/* UI-Update: hide/show title + instructions + mobile controls */
function updateMobileUI() {
    const title = document.querySelector("h1");
    const instructions = document.querySelector(".instructions");
    const container = document.getElementById("mobile-controls");

    if (isMobileDevice() && isLandscape()) {
        if (title) title.classList.add("hidden-mobile-ui");
        if (instructions) instructions.classList.add("hidden-mobile-ui");

        if (container && container.childElementCount === 0) createMobileControls();
        if (container) container.style.display = "flex";
    } else {
        if (title) title.classList.remove("hidden-mobile-ui");
        if (instructions) instructions.classList.remove("hidden-mobile-ui");

        if (container) container.style.display = "none";
    }
}

/* Sperre / Hinweis für Portrait auf Mobile */
function lockToLandscape() {
    const overlay = document.getElementById("rotate-overlay");
    const content = document.getElementById("content");

    if (isMobileDevice() && !isLandscape()) {
        // Portrait auf Mobile -> Overlay anzeigen, Spiel verstecken
        if (overlay) overlay.style.display = "flex";
        if (content) content.style.display = "none";
    } else {
        // Landscape oder Desktop -> Overlay verstecken, Spiel zeigen
        if (overlay) overlay.style.display = "none";
        if (content) content.style.display = "inline-block";
    }
}

/* Fullscreen change -> body no-scroll setzen/entfernen */
function onFullscreenChange() {
    const active = FullscreenAPI.isActive();
    if (active) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

// Events: initialisieren / reagieren
window.addEventListener("load", () => {
    lockToLandscape();
    updateMobileUI();
    // Wenn Mobil + Landscape: zeige Prompt (wartet auf ersten Tap)
    if (isMobileDevice() && isLandscape()) {
        showFullscreenPromptOnce();
    }
});

window.addEventListener("resize", () => {
    lockToLandscape();
    updateMobileUI();
    if (isMobileDevice() && isLandscape()) showFullscreenPromptOnce();
});

window.addEventListener("orientationchange", () => {
    lockToLandscape();
    updateMobileUI();
    if (isMobileDevice() && isLandscape()) showFullscreenPromptOnce();
});

// Fullscreen-change Events (auch vendor event für ältere WebKit)
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);
document.addEventListener('msfullscreenchange', onFullscreenChange);

// ----------------- Tastatur / Input Handling -----------------

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
