window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePause();
});

/**
 * Handles key press/release.
 * @function
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {boolean} isPressed - Whether the key is pressed or released.
 * @returns {void}
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

/**
 * Checks if event is right arrow key.
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isRight(event) { return event.keyCode === 39; }

/**
 * Checks if event is left arrow key.
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isLeft(event) { return event.keyCode === 37; }

/**
 * Checks if event is up arrow key.
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isUp(event) { return event.keyCode === 38; }

/**
 * Checks if event is down arrow key.
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isDown(event) { return event.keyCode === 40; }

/**
 * Checks if event is space key.
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isSpace(event) { return event.keyCode === 32; }

/**
 * Checks if event is throw key (D).
 * @function
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
function isThrow(event) { return event.keyCode === 68; }

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

/**
 * Detects if device is mobile.
 * @function
 * @returns {boolean} True if mobile device.
 */
function detectDevice() {
    const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return (isMobileUA || isTouch);
}

/**
 * Binds mobile control buttons.
 * @function
 * @returns {void}
 */
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
 * Binds a single control button.
 * @function
 * @param {{id: string, key: string}} control - Control button config.
 * @returns {void}
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
 * Sets a keyboard key state.
 * @function
 * @param {string} key - The key to set.
 * @param {boolean} isPressed - Whether the key is pressed.
 * @returns {void}
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

/**
 * Handles device orientation.
 * @function
 * @returns {void}
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
 * Exits fullscreen mode if active.
 * @function
 * @returns {void}
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

window.addEventListener("beforeunload", () => stopMusic());
document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseMusic();
    else resumeMusic();
});

/**
 * Applies saved volume to all sounds.
 * @function
 * @returns {void}
 */
function applyVolume() {
    backgroundMusic.volume = gameVolume;
    hitSound.volume = gameVolume * 0.6;
    winSound.volume = gameVolume;
    failSound.volume = gameVolume;
}

/**
 * Opens the settings overlay.
 * @function
 * @param {string} fromOverlayId - Overlay to return to later.
 * @returns {void}
 */
function openSettings(fromOverlayId) {
    lastOverlay = fromOverlayId;
    document.getElementById(fromOverlayId).classList.add("hidden");
    document.getElementById("settings-overlay").classList.remove("hidden");
    bindVolumeSlider();
}

/**
 * Binds the volume slider to update volume.
 * @function
 * @returns {void}
 */
function bindVolumeSlider() {
    const slider = document.getElementById("volume-slider");
    slider.value = gameVolume;
    slider.addEventListener("input", (e) => {
        gameVolume = parseFloat(e.target.value);
        localStorage.setItem("gameVolume", gameVolume);
        applyVolume();
    });
}

/**
 * Closes settings and returns to last overlay.
 * @function
 * @returns {void}
 */
function closeSettings() {
    document.getElementById("settings-overlay").classList.add("hidden");
    if (lastOverlay) {
        document.getElementById(lastOverlay).classList.remove("hidden");
    }
}

/**
 * Returns to the start screen.
 * @function
 * @returns {void}
 */
function returnToMenu() {
    stopMusic();
    clearCanvas();
    gameStarted = false;
    gamePaused = false;
    resetOverlays();
    if (!document.getElementById("start-screen")) createStartScreen();
}

/**
 * Resets overlays to default state.
 * @function
 * @returns {void}
 */
function resetOverlays() {
    document.getElementById("pause-overlay").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("pause-btn").classList.add("hidden");
    document.getElementById("mobile-controls").classList.add("hidden");
}

/**
 * Creates a new start screen.
 * @function
 * @returns {void}
 */
function createStartScreen() {
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