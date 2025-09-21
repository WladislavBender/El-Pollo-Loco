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
     * Initializes the world with a canvas and keyboard input.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Object} keyboard - The keyboard input handler.
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

    /**
     * Resets collected items to initial state.
     */
    resetCollectables() {
        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;
    }

    /**
     * Assigns world references to character and enemies.
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => enemy.world = this);
    }

    /**
     * Runs the game loop periodically.
     */
    run() {
        this.gameInterval = setInterval(() => {
            if (this.gameOver || this.paused) return;
            this.checkCollisions();
            this.checkThrowObjects();
            this.triggerEndboss();
            this.handleCharacterDeath();
        }, 200);
    }

    /**
     * Triggers the endboss alert sequence.
     */
    triggerEndboss() {
        let boss = this.level.enemies.find(e => e instanceof Endboss);
        if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
            boss.startAlert(this.statusBar);
        }
    }

    /**
     * Handles character death sequence.
     */
    handleCharacterDeath() {
        if (this.character.isDead() && !this.character.deathSequenceStarted) {
            this.character.startDeath(() => {
                if (!this.gameOver) this.endGame(false);
            });
        }
    }

    /**
     * Main draw loop for rendering objects.
     */
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
        if (!this.paused) {
            this.animationFrame = requestAnimationFrame(() => this.draw());
        }
    }

    /**
     * Clears the entire canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Adds multiple objects to the map.
     * @param {Array} objects - Array of game objects.
     */
    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    /**
     * Adds a single object to the map.
     * @param {Object} mo - Movable object.
     */
    addToMap(mo) {
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /**
     * Flips an object horizontally.
     * @param {Object} mo - Movable object.
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x *= -1;
    }

    /**
     * Restores an object's orientation.
     * @param {Object} mo - Movable object.
     */
    flipImageBack(mo) {
        mo.x *= -1;
        this.ctx.restore();
    }

    /**
     * Spawns clouds across the level.
     */
    spawnClouds() {
        let cloudsNeeded = Math.ceil(this.canvas.width / 500) + 3;
        for (let i = 0; i < cloudsNeeded; i++) {
            this.level.clouds.push(new Cloud());
        }
    }

    /**
     * Spawns collectible objects in the world.
     */
    spawnCollectables() {
        for (let i = 0; i < 10; i++) {
            this.collectableObjects.push(
                new CollectableObject("bottle", Math.random() * 2000 + 200, 350)
            );
            this.collectableObjects.push(
                new CollectableObject("coin", Math.random() * 2000 + 200, 15 + Math.random() * 60)
            );
        }
    }

    /**
     * Checks if thrown bottles hit enemies.
     */
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
     * @param {Object} enemy - Enemy hit.
     * @param {number} j - Enemy index.
     * @param {number} i - Bottle index.
     */
    handleBottleImpact(enemy, j, i) {
        if (enemy instanceof Chicken) this.killChicken(enemy, j);
        if (enemy instanceof Endboss) this.hitEndboss(enemy);
        this.removeBottle(i);
    }

    /**
     * Kills a chicken enemy.
     * @param {Object} enemy - Chicken enemy.
     * @param {number} idx - Index of enemy.
     */
    killChicken(enemy, idx) {
        enemy.die();
        setTimeout(() => this.level.enemies.splice(idx, 1), 200);
    }

    /**
     * Handles when the endboss is hit.
     * @param {Object} enemy - Endboss enemy.
     */
    hitEndboss(enemy) {
        enemy.hit();
        this.statusBar.setPercentage("endboss", enemy.energy);
        if (enemy.isDead() && !enemy.deathSequenceStarted) {
            enemy.startDeath(() => {
                if (!this.gameOver) this.endGame(true);
            });
        }
    }

    /**
     * Removes a thrown bottle from the list.
     * @param {number} i - Index of bottle.
     */
    removeBottle(i) {
        this.throwableObjects.splice(i, 1);
    }

    /**
     * Checks collisions between character, enemies, and collectables.
     */
    checkCollisions() {
        if (this.paused) return;
        this.level.enemies.forEach(enemy => this.handleEnemyCollision(enemy));
        this.collectableObjects = this.collectableObjects.filter(obj => !this.collectItem(obj));
        if (this.character.isDead()) this.endGame(false);
    }

    /**
     * Handles collision with an enemy.
     * @param {Object} enemy - The enemy object.
     */
    handleEnemyCollision(enemy) {
        if (!enemy.dead && this.character.isColliding(enemy)) {
            if (enemy instanceof Endboss) {
                enemy.startAttack();
                this.character.energy = Math.max(this.character.energy - 15, 0);
            } else {
                this.character.hit();
            }
            this.statusBar.setPercentage("health", this.character.energy);
            playHitSound();
        }
    }

    /**
     * Collects a coin or bottle if collided.
     * @param {Object} obj - Collectable object.
     * @returns {boolean} True if collected.
     */
    collectItem(obj) {
        if (!this.character.isCollidingCollectable(obj)) return false;
        if (obj.type === "coin") this.updateCollectable("coins", +1);
        if (obj.type === "bottle" && this.bottles < this.totalBottles) {
            this.updateCollectable("bottles", +1);
        }
        return true;
    }

    /**
     * Updates the number of collected items and updates status bar.
     * @param {string} type - Type of collectable.
     * @param {number} delta - Value to change.
     */
    updateCollectable(type, delta) {
        this[type] += delta;
        this[type] = Math.max(0, Math.min(
            this[type],
            this["total" + type.charAt(0).toUpperCase() + type.slice(1)]
        ));
        let total = this["total" + type.charAt(0).toUpperCase() + type.slice(1)];
        this.statusBar.setPercentage(type, Math.min((this[type] / total) * 100, 100));
    }

    /**
     * Checks if character throws bottles.
     */
    checkThrowObjects() {
        if (this.paused) return;
        if (this.keyboard.D && this.bottles > 0 && !this.throwCooldown) {
            this.throwBottle();
        }
    }

    /**
     * Creates and throws a bottle object.
     */
    throwBottle() {
        const handHeight = this.character.height * 0.3;
        const sideOffset = this.character.width * 0.5;
        const offsetX = this.character.otherDirection ? -sideOffset : sideOffset;
        const offsetY = handHeight;
        const bottle = new ThrowableObject(
            this.character.x + offsetX,
            this.character.y + offsetY,
            this.character.otherDirection
        );
        this.throwableObjects.push(bottle);
        this.updateCollectable("bottles", -1);
        this.throwCooldown = true;
        setTimeout(() => this.throwCooldown = false, 300);
    }

    /**
     * Ends the game with win or loss state.
     * @param {boolean} won - True if player won.
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

    /**
     * Hides on-screen controls after game ends.
     */
    hideControls() {
        const mobileControls = document.getElementById("mobile-controls");
        if (mobileControls) mobileControls.classList.add("hidden");
        document.getElementById("pause-btn").classList.add("hidden");
    }

    /**
     * Draws the end screen after the game ends.
     */
    drawEndScreen() {
        const endScreen = document.getElementById("end-screen");
        endScreen.style.backgroundImage = this.getEndscreenImage();
        endScreen.classList.remove("hidden");
        endScreen.classList.add("show");
        document.getElementById("restart-btn").onclick = () => restartGame();
        if (soundEnabled) this.playEndSound();
    }

    /**
     * Plays the win or fail sound.
     */
    playEndSound() {
        let sound = this.gameWon ? winSound : failSound;
        sound.currentTime = 0;
        sound.play().catch(err => console.log("Sound blocked:", err));
    }

    /**
     * Returns the correct image for the end screen.
     * @returns {string} The background image URL.
     */
    getEndscreenImage() {
        return this.gameWon
            ? "url('img/You won, you lost/You won A.png')"
            : "url('img/You won, you lost/You lost.png')";
    }

    /**
     * Pauses the game loop and animations.
     */
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

    /**
     * Resumes the game loop and animations.
     */
    resume() {
        this.paused = false;
        if (!this.gameInterval) this.run();
        if (!this.animationFrame) this.draw();
    }
}
