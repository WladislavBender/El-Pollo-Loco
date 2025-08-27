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
    totalCoins = 10; // für Prozentberechnung
    totalBottles = 10;



    // Im World-Konstruktor gleich initialisieren
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

        this.bottles = 0;
        this.coins = 0;
        this.totalCoins = 10;
        this.totalBottles = 10;

        this.spawnCollectables();
        this.spawnClouds();   // 🌥️ Clouds beim Start erzeugen
        this.draw();
        this.setWorld();
        this.run();
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
            let yOffset = Math.random() * 60 - 120;
            let y = baseY + yOffset;
            this.collectableObjects.push(new CollectableObject('coin', x, y));
        }
    }


    setWorld() {
        this.character.world = this;
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();

            // Endboss Trigger bei X >= 2000
            let boss = this.level.enemies.find(e => e instanceof Endboss);
            if (boss && !boss.inAlert && !boss.moving && this.character.x >= 2000) {
                boss.startAlert();
            }
        }, 200);
    }



    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.ctx.translate(this.camera_x, 0);

        // **NEU: pro Frame auf Flaschen-Treffer prüfen**
        this.checkBottleHits();

        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.collectableObjects);
        this.addObjectsToMap(this.throwableObjects);

        this.ctx.translate(-this.camera_x, 0);

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    checkBottleHits() {
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
                        enemy.hit(); // <-- wichtig: ruft das Override oben auf (20 dmg + lastHit)
                        this.statusBar.setPercentage('endboss', enemy.energy);

                        if (enemy.isDead()) {
                            enemy.dead = true;
                            enemy.speed = 0;
                            // animate() spielt automatisch IMAGES_DEAD
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

        // Collectables (bleibt wie bisher)
        this.collectableObjects = this.collectableObjects.filter(obj => {
            if (this.character.isColliding(obj)) {
                if (obj.type === 'coin') {
                    this.coins++;
                    let coinPercentage = Math.min((this.coins / 10) * 100, 100);
                    this.statusBar.setPercentage('coins', coinPercentage);
                } else if (obj.type === 'bottle') {
                    if (this.bottles < 10) {
                        this.bottles++;
                        let bottlePercentage = (this.bottles / 10) * 100;
                        this.statusBar.setPercentage('bottles', bottlePercentage);
                    }
                }
                return false;
            }
            return true;
        });
    }



    // Beispiel: wenn ein Coin eingesammelt wird
    collectCoin() {
        this.coins += 1;
        let coinPercentage = Math.min((this.coins / this.totalCoins) * 100, 100);
        this.statusBar.setPercentage('coins', coinPercentage);
    }

    collectBottle() {
        this.bottles += 1;
        let bottlePercentage = Math.min((this.bottles / this.totalBottles) * 100, 100);
        this.statusBar.setPercentage('bottles', bottlePercentage);
    }

    checkThrowObjects() {
        // Prüfen, ob Flaschen vorhanden sind und Taste nur einmal erkannt wird
        if (this.keyboard.D && this.bottles > 0 && !this.throwCooldown) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);

            this.bottles--;
            let bottlePercentage = (this.bottles / this.totalBottles) * 100;  // ✅ dynamisch
            this.statusBar.setPercentage('bottles', bottlePercentage);


            // Kurzer Cooldown, damit nicht pro Frame eine geworfen wird
            this.throwCooldown = true;
            setTimeout(() => this.throwCooldown = false, 300);
        }
    }


    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
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
        // +2 für Sicherheit (damit man keine Lücke sieht)

        for (let i = 0; i < cloudsNeeded; i++) {
            this.level.clouds.push(new Cloud());
        }
    }


}