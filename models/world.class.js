class World {
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
    paused = false;

    /**
     * Initializes the world with canvas and keyboard.
     * @param {HTMLCanvasElement} canvas
     * @param {Keyboard} keyboard
     */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.resetCollectables();
        this.spawnCollectables();
        this.spawnClouds();
        this.setWorld();
        this.draw();
        this.run();
    }

    /** Resets collected items. */
    resetCollectables() {
        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;
    }

    /** Assigns world references to character and enemies. */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
    }

    /** Main game loop. */
    run() {
        const loop = () => {
            if (!this.gameOver && !this.paused) {
                this.checkCollisions();
                this.checkThrowObjects();
                this.triggerEndboss();
                this.handleCharacterDeath();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /** Alerts the endboss if player reaches trigger point. */
    triggerEndboss() {
        let boss = this.level.enemies.find(e => e instanceof Endboss);
        if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
            boss.startAlert(this.statusBar);
        }
    }

    /** Starts death sequence if character is dead. */
    handleCharacterDeath() {
        if (this.character.isDead() && !this.character.deathSequenceStarted) {
            this.character.startDeath(() => !this.gameOver && this.endGame(false));
        }
    }

    /** Rendering loop. */
    draw() {
        if (this.gameOver) return;
        this.clearCanvas();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);
        this.checkBottleHits();
        this.addToMap(this.character);
        this.addObjectsToMap([
            ...this.level.enemies,
            ...this.collectableObjects,
            ...this.throwableObjects
        ]);
        this.ctx.translate(-this.camera_x, 0);
        if (!this.paused) this.animationFrame = requestAnimationFrame(() => this.draw());
    }

    /** Clears canvas. */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Adds multiple objects to canvas.
     * @param {Array} objects
     */
    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    /**
     * Draws object with optional flip.
     * @param {Object} mo
     */
    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /** Flips image horizontally. */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x *= -1;
    }

    /** Restores flipped image. */
    flipImageBack(mo) {
        mo.x *= -1;
        this.ctx.restore();
    }

    /** Spawns clouds. */
    spawnClouds() {
        let cloudsNeeded = Math.ceil(this.canvas.width / 500) + 3;
        for (let i = 0; i < cloudsNeeded; i++) this.level.clouds.push(new Cloud());
    }

    /** Spawns collectible items. */
    spawnCollectables() {
        for (let i = 0; i < 10; i++) {
            this.collectableObjects.push(new CollectableObject("bottle", Math.random() * 2000 + 200, 350));
            this.collectableObjects.push(new CollectableObject("coin", Math.random() * 2000 + 200, 15 + Math.random() * 60));
        }
    }

    /** Checks bottle collisions with enemies. */
    checkBottleHits() {
        if (this.gameOver || this.paused) return;
        this.throwableObjects.forEach((bottle, i) => {
            this.level.enemies.forEach((enemy, j) => {
                if (!enemy.dead && bottle.isColliding(enemy)) {
                    this.handleBottleImpact(enemy, j, i);
                }
            });
        });
    }

    /**
     * Handles bottle impact with enemies.
     * @param {Object} enemy
     * @param {number} j
     * @param {number} i
     */
    handleBottleImpact(enemy, j, i) {
        if (enemy instanceof Chicken) this.killChicken(enemy, j);
        if (enemy instanceof Endboss) this.hitEndboss(enemy);
        this.removeBottle(i);
    }

    /** Removes bottle by index. */
    removeBottle(i) {
        this.throwableObjects.splice(i, 1);
    }

    /** Kills chicken enemy. */
    killChicken(enemy, idx) {
        enemy.die();
        setTimeout(() => this.level.enemies.splice(idx, 1), 200);
    }

    /** Handles Endboss hit. */
    hitEndboss(enemy) {
        enemy.hit();
        this.statusBar.setPercentage("endboss", enemy.energy);
        if (enemy.isDead() && !enemy.deathSequenceStarted) {
            enemy.startDeath(() => !this.gameOver && this.endGame(true));
        }
    }

    /** Collision checks for character, enemies, collectables. */
    checkCollisions() {
        if (this.paused) return;
        this.level.enemies.forEach((enemy, idx) => this.handleEnemyCollision(enemy, idx));
        this.collectableObjects = this.collectableObjects.filter(obj => !this.collectItem(obj));
        if (this.character.isDead()) this.endGame(false);
    }

    /**
     * Handles collision with enemy.
     * @param {Object} enemy
     * @param {number} idx
     */
    handleEnemyCollision(enemy, idx) {
        if (enemy.dead || !this.character.isColliding(enemy)) return;
        if (enemy instanceof Endboss) return this.hitByEndboss(enemy);
        if (this.character.isJumpingOn(enemy)) return this.landOnEnemy(enemy, idx);
        this.takeDamageFromEnemy(enemy);
    }

    /** Endboss collision damage. */
    hitByEndboss(enemy) {
        enemy.startAttack();
        this.character.hit(enemy);
        this.statusBar.setPercentage("health", this.character.energy);
        playHitSound();
    }

    /** Handles landing on enemy. */
    landOnEnemy(enemy, idx) {
        if (enemy instanceof Chicken) {
            this.killChicken(enemy, idx);
            this.character.speedY = 6;
        } else {
            enemy.die();
        }
    }

    /** Damage when colliding without jumping. */
    takeDamageFromEnemy(enemy) {
        this.character.hit(enemy);
        this.statusBar.setPercentage("health", this.character.energy);
        playHitSound();
    }

    /**
     * Collects items if collided.
     * @param {Object} obj
     * @returns {boolean}
     */
    collectItem(obj) {
        if (!this.character.isCollidingCollectable(obj)) return false;
        if (obj.type === "coin") this.updateCollectable("coins", +1);
        if (obj.type === "bottle" && this.bottles < this.totalBottles) this.updateCollectable("bottles", +1);
        return true;
    }

    /** Updates collectable counters. */
    updateCollectable(type, delta) {
        this[type] += delta;
        let cap = this["total" + type.charAt(0).toUpperCase() + type.slice(1)];
        this[type] = Math.max(0, Math.min(this[type], cap));
        this.statusBar.setPercentage(type, Math.min((this[type] / cap) * 100, 100));
    }

    /** Checks if player throws bottles. */
    checkThrowObjects() {
        if (this.paused) return;
        if (this.keyboard.D && this.bottles > 0 && !this.throwCooldown) this.throwBottle();
    }

    /** Creates and throws bottle. */
    throwBottle() {
        const offsetX = this.character.otherDirection ? -this.character.width * 0.5 : this.character.width * 0.5;
        const offsetY = this.character.height * 0.3;
        const bottle = new ThrowableObject(this.character.x + offsetX, this.character.y + offsetY, this.character.otherDirection);
        this.throwableObjects.push(bottle);
        this.updateCollectable("bottles", -1);
        this.throwCooldown = true;
        setTimeout(() => this.throwCooldown = false, 300);
    }

    /**
     * Ends the game.
     * @param {boolean} won
     */
    endGame(won) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.gameWon = won;
        clearInterval(this.gameInterval);
        cancelAnimationFrame(this.animationFrame);
        this.hideControls();
        setTimeout(() => this.drawEndScreen(), 50);
    }

    /** Hides controls. */
    hideControls() {
        const mobileControls = document.getElementById("mobile-controls");
        if (mobileControls) mobileControls.classList.add("hidden");
        document.getElementById("pause-btn").classList.add("hidden");
    }

    /** Draws end screen. */
    drawEndScreen() {
        const endScreen = document.getElementById("end-screen");
        endScreen.style.backgroundImage = this.getEndscreenImage();
        endScreen.classList.remove("hidden");
        endScreen.classList.add("show");
        document.getElementById("restart-btn").onclick = () => restartGame();
        if (soundEnabled) this.playEndSound();
    }

    /** Plays win/fail sound. */
    playEndSound() {
        let sound = this.gameWon ? winSound : failSound;
        sound.currentTime = 0;
        sound.play().catch(err => console.log("Sound blocked:", err));
    }

    /** Returns endscreen image URL. */
    getEndscreenImage() {
        return this.gameWon
            ? "url('img/You won, you lost/You won A.png')"
            : "url('img/You won, you lost/You lost.png')";
    }

    /** Pauses game loop. */
    pause() {
        this.paused = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /** Resumes game loop. */
    resume() {
        this.paused = false;
        if (!this.gameInterval) this.run();
        if (!this.animationFrame) this.draw();
    }
}