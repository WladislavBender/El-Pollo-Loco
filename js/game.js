let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    console.log('My Character is', world.character);
}

function restartGame() {
    // Canvas löschen
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Neues Level laden
    initLevel();

    // Neue World erstellen
    world = new World(canvas, keyboard);

    // Endscreen wieder ausblenden
    const endScreen = document.getElementById("end-screen");
    endScreen.classList.remove("show");
    endScreen.classList.add("hidden");

    console.log("Neues Spiel gestartet");
}


function toggleFullscreen() {
    const content = document.getElementById("content");
    const title = document.querySelector("#content h1");

    if (!document.fullscreenElement) {
        // Container mit Canvas + Overlays ins Vollbild
        content.requestFullscreen().catch(err => {
            console.error(`Fullscreen-Fehler: ${err.message}`);
        });
        if (title) title.style.display = "none";
    } else {
        // Vollbild verlassen
        document.exitFullscreen();
        // (title wird über fullscreenchange wieder eingeblendet)
    }
}

// Event, das aufgerufen wird, wenn Fullscreen an- oder ausgeschaltet wird
document.addEventListener("fullscreenchange", () => {
    const title = document.querySelector("#content h1");
    if (!document.fullscreenElement && title) {
        title.style.display = "block";
    }
});






// Start-Button Event
window.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    const startScreen = document.getElementById("start-screen");

    startBtn.addEventListener("click", () => {
        // 1. Level initialisieren
        initLevel();

        // 2. Spiel starten
        init();

        // Overlay ausblenden mit Animation
        startScreen.classList.add("fade-out");

        // Optional: nach Animation aus dem DOM entfernen
        setTimeout(() => startScreen.remove(), 1000);
    });
});

window.addEventListener("keydown", (event) => {
    if (event.keyCode == 39) keyboard.RIGHT = true;
    if (event.keyCode == 37) keyboard.LEFT = true;
    if (event.keyCode == 38) keyboard.UP = true;
    if (event.keyCode == 40) keyboard.DOWN = true;
    if (event.keyCode == 32) keyboard.SPACE = true;
    if (event.keyCode == 68) keyboard.D = true;
});

window.addEventListener("keyup", (event) => {
    if (event.keyCode == 39) keyboard.RIGHT = false;
    if (event.keyCode == 37) keyboard.LEFT = false;
    if (event.keyCode == 38) keyboard.UP = false;
    if (event.keyCode == 40) keyboard.DOWN = false;
    if (event.keyCode == 32) keyboard.SPACE = false;
    if (event.keyCode == 68) keyboard.D = false;
});
