class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    collectableObjects = [];

    coins = 0;
    bottles = 0;
    totalCoins = 10;   // für Prozentberechnung
    totalBottles = 10; // für Prozentberechnung

    // Endscreen / Loop-Steuerung
    gameOver = false;
    gameWon = false;
    gameInterval = null;
    animationFrame = null;
    throwCooldown = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;

        this.spawnCollectables();
        this.spawnClouds();
        this.setWorld();

        this.draw();
        this.run();
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        // Wichtig: Handle speichern, damit wir stoppen können
        this.gameInterval = setInterval(() => {
            if (this.gameOver) return;

            this.checkCollisions();
            this.checkThrowObjects();

            // Endboss Trigger bei X >= 2000
            let boss = this.level.enemies.find(e => e instanceof Endboss);
            if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
                boss.startAlert();
            }

            // === Niederlage prüfen ===
            if (!this.gameOver && this.character.isDead()) {
                this.endGame(false); // verloren
            }

            // ❌ WICHTIG: KEIN Sofort-Win mehr hier!
            // Der Sieg wird NUR in der Death-Animation des Bosses getriggert.
        }, 200);
    }

    draw() {
        if (this.gameOver) return; // kein normales Redraw mehr, Endscreen übernimmt

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);

        // pro Frame auf Flaschen-Treffer prüfen
        this.checkBottleHits();

        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.collectableObjects);
        this.addObjectsToMap(this.throwableObjects);

        this.ctx.translate(-this.camera_x, 0);

        // Handle speichern, damit cancelAnimationFrame greift
        this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx); // Debug-Frame (optional)
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    spawnClouds() {
        // Canvas-Breite in Anzahl Clouds berechnen
        let cloudsNeeded = Math.ceil(this.canvas.width / 500) + 3;
        for (let i = 0; i < cloudsNeeded; i++) {
            this.level.clouds.push(new Cloud());
        }
    }

    spawnCollectables() {
        // Zufällige Bottles
        for (let i = 0; i < 10; i++) {
            let x = Math.random() * 2000 + 200;
            let y = 350; // Bottles bleiben fix
            this.collectableObjects.push(new CollectableObject('bottle', x, y));
        }
        // Zufällige Coins mit y-Variation
        for (let i = 0; i < 10; i++) {
            let x = Math.random() * 2000 + 200;
            let baseY = 300;
            let yOffset = Math.random() * 60 - 250;
            let y = baseY + yOffset;
            this.collectableObjects.push(new CollectableObject('coin', x, y));
        }
    }

    checkBottleHits() {
        // Falls Game Over/Win bereits erreicht, keine weiteren Treffer verarbeiten
        if (this.gameOver) return;

        this.throwableObjects.forEach((bottle, bottleIndex) => {
            this.level.enemies.forEach((enemy, enemyIndex) => {
                if (!enemy.dead && bottle.isColliding(enemy)) {

                    if (enemy instanceof Chicken) {
                        enemy.dead = true;
                        enemy.loadImage(enemy.IMAGE_DEAD[0]);
                        enemy.speed = 0;
                        setTimeout(() => this.level.enemies.splice(enemyIndex, 1), 200);
                    }

                    if (enemy instanceof Endboss) {
                        enemy.hit(); // 20 dmg + lastHit
                        this.statusBar.setPercentage('endboss', enemy.energy);

                        // Wenn Boss jetzt "tot" ist → Death-Sequenz starten (nur einmal)
                        if (enemy.isDead() && !enemy.deathSequenceStarted) {
                            enemy.startDeath(() => {
                                if (!this.gameOver) {
                                    this.endGame(true); // Endscreen NACH der Animation
                                }
                            });
                        }
                    }

                    // Flasche nach Treffer entfernen
                    this.throwableObjects.splice(bottleIndex, 1);
                }
            });
        });
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (!enemy.dead && this.character.isColliding(enemy)) {
                if (enemy instanceof Endboss) {
                    enemy.startAttack();   // Attack-Animation starten
                    this.character.energy -= 20; // 20 % Schaden
                    if (this.character.energy < 0) this.character.energy = 0;
                    this.statusBar.setPercentage('health', this.character.energy);
                } else {
                    this.character.hit();
                    this.statusBar.setPercentage('health', this.character.energy);
                }
            }
        });

        // Collectables
        this.collectableObjects = this.collectableObjects.filter(obj => {
            if (this.character.isCollidingCollectable(obj)) {
                if (obj.type === 'coin') {
                    this.coins++;
                    let coinPercentage = Math.min((this.coins / 10) * 100, 100);
                    this.statusBar.setPercentage('coins', coinPercentage);
                } else if (obj.type === 'bottle') {
                    if (this.bottles < 10) {
                        this.bottles++;
                        let bottlePercentage = (this.bottles / this.totalBottles) * 100;
                        this.statusBar.setPercentage('bottles', bottlePercentage);
                    }
                }
                return false; // eingesammelt → entfernen
            }
            return true;
        });

        // Niederlage schon hier abfangen (sofortigeres Feedback)
        if (!this.gameOver && this.character.isDead()) {
            this.endGame(false);
        }
    }

    checkThrowObjects() {
        // Prüfen, ob Flaschen vorhanden sind und Taste nur einmal erkannt wird
        if (this.keyboard.D && this.bottles > 0 && !this.throwCooldown) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);

            this.bottles--;
            let bottlePercentage = (this.bottles / this.totalBottles) * 100;
            this.statusBar.setPercentage('bottles', bottlePercentage);

            // Kurzer Cooldown, damit nicht pro Frame eine geworfen wird
            this.throwCooldown = true;
            setTimeout(() => this.throwCooldown = false, 300);
        }
    }

    endGame(won) {
        if (this.gameOver) return; // nur einmal ausführen
        this.gameOver = true;
        this.gameWon = won;

        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        // Zeichne den Endscreen im Canvas
        // (kleiner Delay, damit evtl. letzte Sprites fertig sind)
        setTimeout(() => this.drawEndScreen(), 50);
    }

    drawEndScreen() {
        const endScreen = document.getElementById("end-screen");

        // Hintergrundbild je nach Ergebnis setzen
        endScreen.style.backgroundImage = this.gameWon
            ? "url('img/You won, you lost/You won A.png')"
            : "url('img/You won, you lost/You lost.png')";

        // Endscreen sichtbar machen + Effekt starten
        endScreen.classList.remove("hidden");
        endScreen.classList.add("show");

        // Restart-Button aktivieren
        const restartBtn = document.getElementById("restart-btn");
        restartBtn.onclick = () => restartGame();
    }

    // Klick auf Canvas-Button (mit CSS-Scaling-Korrektur)
    handleRestartClick = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const btnW = 160;
        const btnH = 56;
        const btnX = this.canvas.width / 2 - btnW / 2;
        const btnY = this.canvas.height - 100;

        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            this.canvas.removeEventListener("click", this.handleRestartClick);
            restartGame();
        }
    };
}
