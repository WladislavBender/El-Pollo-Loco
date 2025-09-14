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
    totalCoins = 10;
    totalBottles = 10;
    gameOver = false;
    gameWon = false;
    gameInterval = null;
    animationFrame = null;
    throwCooldown = false;

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

    resetCollectables() {
        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;
    }

    setWorld() {
        this.character.world = this;
    }

    run() {
        this.gameInterval = setInterval(() => {
            if (this.isGameOver()) return;
            this.checkCollisions();
            this.checkThrowObjects();
            this.triggerEndboss();
            this.checkImmediateDefeat();
        }, 200);
    }

    isGameOver() {
        return this.gameOver;
    }

    triggerEndboss() {
        let boss = this.level.enemies.find(e => e instanceof Endboss);
        if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
            boss.startAlert();
        }
    }

    checkImmediateDefeat() {
        if (!this.gameOver && this.character.isDead()) {
            this.endGame(false);
        }
    }

    draw() {
        if (this.isGameOver()) return;
        this.clearCanvas();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);
        this.checkBottleHits();
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.collectableObjects);
        this.addObjectsToMap(this.throwableObjects);
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
        if (this.isOtherDirection(mo)) this.flipImage(mo);
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);
        if (this.isOtherDirection(mo)) this.flipImageBack(mo);
    }

    isOtherDirection(mo) {
        return mo.otherDirection;
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
        let cloudsNeeded = Math.ceil(this.canvas.width / 500) + 3;
        for (let i = 0; i < cloudsNeeded; i++) {
            this.level.clouds.push(new Cloud());
        }
    }

    spawnCollectables() {
        for (let i = 0; i < 10; i++) {
            let x = Math.random() * 2000 + 200;
            let y = 350;
            this.collectableObjects.push(new CollectableObject('bottle', x, y));
        }
        for (let i = 0; i < 10; i++) {
            let x = Math.random() * 2000 + 200;
            let y = 300 + (Math.random() * 60 - 250);
            this.collectableObjects.push(new CollectableObject('coin', x, y));
        }
    }

    checkBottleHits() {
        if (this.isGameOver()) return;
        this.throwableObjects.forEach((bottle, bottleIndex) => {
            this.level.enemies.forEach((enemy, enemyIndex) => {
                if (this.isBottleHit(bottle, enemy)) {
                    this.handleEnemyHit(enemy, enemyIndex);
                    this.removeBottle(bottleIndex);
                }
            });
        });
    }

    isBottleHit(bottle, enemy) {
        return !enemy.dead && bottle.isColliding(enemy);
    }

    handleEnemyHit(enemy, enemyIndex) {
        if (enemy instanceof Chicken) this.killChicken(enemy, enemyIndex);
        if (enemy instanceof Endboss) this.hitEndboss(enemy);
    }

    killChicken(enemy, enemyIndex) {
        enemy.dead = true;
        enemy.loadImage(enemy.IMAGE_DEAD[0]);
        enemy.speed = 0;
        setTimeout(() => this.level.enemies.splice(enemyIndex, 1), 200);
    }

    hitEndboss(enemy) {
        enemy.hit();
        this.statusBar.setPercentage('endboss', enemy.energy);
        if (enemy.isDead() && !enemy.deathSequenceStarted) {
            enemy.startDeath(() => {
                if (!this.isGameOver()) this.endGame(true);
            });
        }
    }

    removeBottle(bottleIndex) {
        this.throwableObjects.splice(bottleIndex, 1);
    }

    checkCollisions() {
        this.level.enemies.forEach(enemy => {
            if (this.isEnemyCollision(enemy)) {
                this.handleEnemyCollision(enemy);
                playHitSound();
            }
        });
        this.collectableObjects = this.collectableObjects.filter(obj => !this.collectItem(obj));
        this.checkImmediateDefeat();
    }

    isEnemyCollision(enemy) {
        return !enemy.dead && this.character.isColliding(enemy);
    }

    handleEnemyCollision(enemy) {
        if (enemy instanceof Endboss) {
            enemy.startAttack();
            this.character.hit();
            this.character.energy = Math.max(this.character.energy - 15, 0);
            this.statusBar.setPercentage('health', this.character.energy);
        } else {
            this.character.hit();
            this.statusBar.setPercentage('health', this.character.energy);
        }
    }

    collectItem(obj) {
        if (!this.character.isCollidingCollectable(obj)) return false;
        if (obj.type === 'coin') this.collectCoin();
        if (obj.type === 'bottle') this.collectBottle();
        return true;
    }

    collectCoin() {
        this.coins++;
        let coinPercentage = Math.min((this.coins / this.totalCoins) * 100, 100);
        this.statusBar.setPercentage('coins', coinPercentage);
    }

    collectBottle() {
        if (this.bottles < this.totalBottles) {
            this.bottles++;
            let bottlePercentage = (this.bottles / this.totalBottles) * 100;
            this.statusBar.setPercentage('bottles', bottlePercentage);
        }
    }

    checkThrowObjects() {
        if (this.canThrowBottle()) {
            this.throwBottle();
            this.updateBottleStatus();
            this.startThrowCooldown();
        }
    }

    canThrowBottle() {
        return this.keyboard.D && this.bottles > 0 && !this.throwCooldown;
    }

    throwBottle() {
        let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
        this.throwableObjects.push(bottle);
        this.bottles--;
    }

    updateBottleStatus() {
        let bottlePercentage = (this.bottles / this.totalBottles) * 100;
        this.statusBar.setPercentage('bottles', bottlePercentage);
    }

    startThrowCooldown() {
        this.throwCooldown = true;
        setTimeout(() => this.throwCooldown = false, 300);
    }

    endGame(won) {
        if (this.isGameOver()) return;
        this.gameOver = true;
        this.gameWon = won;
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        setTimeout(() => this.drawEndScreen(), 50);
    }

    drawEndScreen() {
        const endScreen = document.getElementById("end-screen");
        endScreen.style.backgroundImage = this.getEndscreenImage();
        endScreen.classList.remove("hidden");
        endScreen.classList.add("show");
        document.getElementById("restart-btn").onclick = () => restartGame();

        if (soundEnabled) {
            if (this.gameWon) {
                winSound.currentTime = 0;
                winSound.play().catch(err => console.log("Win-Sound blockiert:", err));
            } else {
                failSound.currentTime = 0;
                failSound.play().catch(err => console.log("Fail-Sound blockiert:", err));
            }
        }
    }

    getEndscreenImage() {
        return this.gameWon
            ? "url('img/You won, you lost/You won A.png')"
            : "url('img/You won, you lost/You lost.png')";
    }

    // --- NEU: Pause / Resume ---
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
        if (!this.gameInterval) {
            this.run();
        }
        if (!this.animationFrame) {
            this.draw();
        }
    }
}

function togglePause() {
    if (gamePaused) {
        resumeGame();
        document.getElementById("pause-btn").innerText = "⏸"; // Button zeigt Pause-Symbol
    } else {
        pauseGame();
        document.getElementById("pause-btn").innerText = "▶️"; // Button zeigt Play-Symbol
    }
}

