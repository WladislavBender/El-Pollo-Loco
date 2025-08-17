let canvas;
let world;
let keyboard = new Keyboard();


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);


    console.log('My Character is', world.character);

}


// Start-Button Event
window.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    const startScreen = document.getElementById("start-screen");

    startBtn.addEventListener("click", () => {
        // 1. Level initialisieren
        initLevel();

        // Spiel starten
        init();

        // Overlay ausblenden mit Animation
        startScreen.classList.add("fade-out");

        // Optional: nach Animation aus dem DOM entfernen
        setTimeout(() => startScreen.remove(), 1000);
    });
});



// function circleTransition(callback) {
//     const tCanvas = document.getElementById("transition");
//     const ctx = tCanvas.getContext("2d");
//     let radius = 0;

//     function animate() {
//         ctx.clearRect(0, 0, tCanvas.width, tCanvas.height);
//         ctx.fillStyle = "black";
//         ctx.fillRect(0, 0, tCanvas.width, tCanvas.height);

//         // Kreis "Loch" ins Schwarz
//         ctx.save();
//         ctx.globalCompositeOperation = "destination-out";
//         ctx.beginPath();
//         ctx.arc(tCanvas.width / 2, tCanvas.height / 2, radius, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.restore();

//         radius += 15; // Geschwindigkeit
//         if (radius < Math.max(tCanvas.width, tCanvas.height)) {
//             requestAnimationFrame(animate);
//         } else {
//             tCanvas.remove();
//             if (callback) callback();
//         }
//     }
//     animate();
// }



window.addEventListener("keydown", (event) => {
    if (event.keyCode == 39)
        keyboard.RIGHT = true;

    if (event.keyCode == 37)
        keyboard.LEFT = true;

    if (event.keyCode == 38)
        keyboard.UP = true;

    if (event.keyCode == 40)
        keyboard.DOWN = true;

    if (event.keyCode == 32)
        keyboard.SPACE = true;

    if (event.keyCode == 68)
        keyboard.D = true;
})


window.addEventListener("keyup", (event) => {
    if (event.keyCode == 39)
        keyboard.RIGHT = false;

    if (event.keyCode == 37)
        keyboard.LEFT = false;

    if (event.keyCode == 38)
        keyboard.UP = false;

    if (event.keyCode == 40)
        keyboard.DOWN = false;

    if (event.keyCode == 32)
        keyboard.SPACE = false;

    if (event.keyCode == 68)
        keyboard.D = false;
})