/* =================== World Class =================== */
class World {
    /* =================== Properties =================== */
    character = new Character();
    level = level1;
    canvas; ctx; keyboard;
    camera_x = 0;

    statusBar = new StatusBar();
    throwableObjects = [];
    collectableObjects = [];

    coins = 0;
    bottles = 0;
    totalCoins = 10;
    totalBottles = 10;

    gameOver = false;
    gameWon = false;
    gameInterval = null;
    animationFrame = null;
    throwCooldown = false;

    /* =================== Initialization =================== */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.resetCollectables();
        this.spawnCollectables();
        this.spawnClouds();
        this.setWorld();

        this.draw();
        this.run();
    }

    /**
     * Resets coin and bottle counters.
     */
    resetCollectables() {
        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;
    }

    /**
     * Links character to world.
     */
    setWorld() {
        this.character.world = this;
    }

    /* =================== Game Loop =================== */
    run() {
        this.gameInterval = setInterval(() => {
            if (this.gameOver) return;

            this.checkCollisions();
            this.checkThrowObjects();
            this.triggerEndboss();

            if (this.character.isDead()) this.endGame(false);
        }, 200);
    }

    /* =================== Endboss Handling =================== */
    triggerEndboss() {
        let boss = this.level.enemies.find(e => e instanceof Endboss);
        if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
            boss.startAlert(this.statusBar);
        }
    }

    /* =================== Rendering =================== */
    draw() {
        if (this.gameOver) return;

        this.clearCanvas();
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);   // Clouds VOR die Statusbar
        this.ctx.translate(-this.camera_x, 0);

        this.addToMap(this.statusBar);   // Statusbar bleibt immer oben
        this.ctx.translate(this.camera_x, 0);

        this.checkBottleHits();
        this.addToMap(this.character);

        this.addObjectsToMap([
            ...this.level.enemies,
            ...this.collectableObjects,
            ...this.throwableObjects
        ]);


        this.ctx.translate(-this.camera_x, 0);
        this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /* =================== Flipping =================== */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x *= -1;
    }

    flipImageBack(mo) {
        mo.x *= -1;
        this.ctx.restore();
    }

    /* =================== Clouds & Collectables =================== */
    spawnClouds() {
        let cloudsNeeded = Math.ceil(this.canvas.width / 500) + 3;
        for (let i = 0; i < cloudsNeeded; i++) {
            this.level.clouds.push(new Cloud());
        }
    }

    spawnCollectables() {
        for (let i = 0; i < 10; i++) {
            this.collectableObjects.push(new CollectableObject('bottle', Math.random() * 2000 + 200, 350));
            this.collectableObjects.push(new CollectableObject('coin', Math.random() * 2000 + 200, 300 + (Math.random() * 60 - 250)));
        }
    }

    /* =================== Bottle Collisions =================== */
    checkBottleHits() {
        if (this.gameOver) return;

        this.throwableObjects.forEach((bottle, i) => {
            this.level.enemies.forEach((enemy, j) => {
                if (!enemy.dead && bottle.isColliding(enemy)) {
                    if (enemy instanceof Chicken) this.killChicken(enemy, j);
                    if (enemy instanceof Endboss) this.hitEndboss(enemy);
                    this.removeBottle(i);
                }
            });
        });
    }

    killChicken(enemy, idx) {
        enemy.dead = true;
        enemy.loadImage(enemy.IMAGE_DEAD[0]);
        enemy.speed = 0;
        setTimeout(() => this.level.enemies.splice(idx, 1), 200);
    }

    hitEndboss(enemy) {
        enemy.hit();
        this.statusBar.setPercentage('endboss', enemy.energy);

        if (enemy.isDead() && !enemy.deathSequenceStarted) {
            enemy.startDeath(() => {
                if (!this.gameOver) this.endGame(true);
            });
        }
    }

    removeBottle(i) {
        this.throwableObjects.splice(i, 1);
    }

    /* =================== Collisions =================== */
    checkCollisions() {
        this.level.enemies.forEach(enemy => {
            if (!enemy.dead && this.character.isColliding(enemy)) {
                if (enemy instanceof Endboss) {
                    enemy.startAttack();
                    this.character.energy = Math.max(this.character.energy - 15, 0);
                } else {
                    this.character.hit();
                }
                this.statusBar.setPercentage('health', this.character.energy);
                playHitSound();
            }
        });

        this.collectableObjects = this.collectableObjects.filter(obj => !this.collectItem(obj));

        if (this.character.isDead()) this.endGame(false);
    }

    /* =================== Collectables =================== */
    collectItem(obj) {
        if (!this.character.isCollidingCollectable(obj)) return false;

        if (obj.type === 'coin') this.updateCollectable('coins');
        if (obj.type === 'bottle' && this.bottles < this.totalBottles) this.updateCollectable('bottles');
        return true;
    }

    updateCollectable(type) {
        this[type]++;
        let total = this["total" + type.charAt(0).toUpperCase() + type.slice(1)];
        this.statusBar.setPercentage(type, Math.min((this[type] / total) * 100, 100));
    }

    /* =================== Throwing Bottles =================== */
    checkThrowObjects() {
        if (this.keyboard.D && this.bottles > 0 && !this.throwCooldown) {
            this.throwableObjects.push(new ThrowableObject(this.character.x + 100, this.character.y + 100));
            this.bottles--;
            this.updateCollectable('bottles');

            this.throwCooldown = true;
            setTimeout(() => this.throwCooldown = false, 300);
        }
    }

    /* =================== Game Over Handling =================== */
    endGame(won) {
        if (this.gameOver) return;

        this.gameOver = true;
        this.gameWon = won;

        clearInterval(this.gameInterval);
        cancelAnimationFrame(this.animationFrame);

        setTimeout(() => this.drawEndScreen(), 50);
    }

    drawEndScreen() {
        const endScreen = document.getElementById("end-screen");
        endScreen.style.backgroundImage = this.getEndscreenImage();
        endScreen.classList.remove("hidden");
        endScreen.classList.add("show");

        document.getElementById("restart-btn").onclick = () => restartGame();

        if (soundEnabled) {
            let sound = this.gameWon ? winSound : failSound;
            sound.currentTime = 0;
            sound.play().catch(err => console.log("Sound blockiert:", err));
        }
    }

    getEndscreenImage() {
        return this.gameWon
            ? "url('img/You won, you lost/You won A.png')"
            : "url('img/You won, you lost/You lost.png')";
    }

    /* =================== Pause & Resume =================== */
    pause() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    resume() {
        if (!this.gameInterval) this.run();
        if (!this.animationFrame) this.draw();
    }
}

/* =================== Global Pause Button =================== */
function togglePause() {
    if (gamePaused) {
        resumeGame();
        document.getElementById("pause-btn").innerText = "⏸";
    } else {
        pauseGame();
        document.getElementById("pause-btn").innerText = "▶️";
    }
}
