class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 0.1;
    energy = 100;
    lastHit = 0;

    /**
     * Checks if the object is above ground.
     * @returns {boolean} True if above ground.
     */
    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 135;
    }

    /**
     * Gets the collision box depending on object type.
     * @returns {{ x:number, y:number, w:number, h:number }} Collision box.
     */
    getCollisionBox() {
        if (this instanceof Character) {
            const offsetX = 30;       // Seiten enger
            const offsetYTop = 110;   // Kopf/Hut/Haare ignorieren
            const offsetYBottom = 10; // Füße minimal freilassen
            return {
                x: this.x + offsetX,
                y: this.y + offsetYTop,
                w: this.width - offsetX * 2,
                h: this.height - offsetYTop - offsetYBottom
            };
        }

        if (this instanceof Endboss) return this.getEndbossCollisionBox();
        if (this instanceof ThrowableObject) return this.getBottleCollisionBox();

        if (this instanceof Chicken || this instanceof ChickenSmall) {
            const offsetX = 20;        // Seiten kürzen (Flügel)
            const offsetYTop = 5;      // Kopf etwas frei
            const offsetYBottom = 15;  // unten freier → Jump zuverlässiger
            return {
                x: this.x + offsetX,
                y: this.y + offsetYTop,
                w: this.width - offsetX * 2,
                h: this.height - offsetYTop - offsetYBottom
            };
        }

        // Coins & Bottles (Collectables) über type prüfen
        if (this.type === 'coin') return this.getCoinCollisionBox();
        if (this.type === 'bottle') return this.getBottleCollectableCollisionBox();

        // Default: volle Box
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * Gets collision box for Endboss.
     */
    getEndbossCollisionBox() {
        const offsetX = 50;
        const offsetYTop = 40;
        const offsetYBottom = 20;
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
    }

    /**
     * Gets collision box for ThrowableObject (flying bottle).
     */
    getBottleCollisionBox() {
        const offset = 20;
        return {
            x: this.x + offset,
            y: this.y + offset,
            w: this.width - offset * 2,
            h: this.height - offset * 2
        };
    }

    /**
     * Gets collision box for Character.
     */
    getCharacterCollisionBox() {
        const offsetX = 20;
        const offsetYTop = 120;
        const offsetYBottom = 20;
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
    }

    /**
      * Gets collision box for Coin (collectable).
      */
    getCoinCollisionBox() {
        const offset = 60; // vorher 10 → kleinerer Sammelbereich
        return {
            x: this.x + offset,
            y: this.y + offset,
            w: this.width - offset * 2,
            h: this.height - offset * 2
        };
    }

    /**
     * Gets collision box for Bottle (collectable).
     */
    getBottleCollectableCollisionBox() {
        const offsetX = 40; // vorher 8 → enger an den Flaschenkörper
        const offsetY = 10; // vorher 15 → enger oben/unten
        return {
            x: this.x + offsetX,
            y: this.y + offsetY,
            w: this.width - offsetX * 2,
            h: this.height - offsetY * 2
        };
    }

    /**
     * Checks collision with another movable object.
     */
    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox ? mo.getCollisionBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks collision with a collectable object.
     */
    isCollidingCollectable(mo) {
        const a = this.getCollisionBox();
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks if two collision boxes overlap.
     */
    boxesOverlap(a, b) {
        return a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h;
    }

    /**
     * Starts gravity application loop.
     */
    applyGravity() {
        setInterval(() => {
            if (this.shouldApplyGravity()) this.applyVerticalMovement();
        }, 100 / 25);

        this.prevY = this.y;
    }

    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    applyVerticalMovement() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 6;
    }

    /**
     * Applies damage to the object depending on attacker type.
     */
    hit(attacker) {
        if (this instanceof Character) return;

        let damage = 1;
        if (attacker instanceof Chicken || attacker instanceof ChickenSmall) {
            damage = 1;
        } else if (attacker instanceof Endboss) {
            damage = 0;
        }

        this.energy = Math.max(0, this.energy - damage);
        if (!this.isDead()) {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        return (new Date().getTime() - this.lastHit) / 1000 < 1.5;
    }

    isDead() {
        return this.energy === 0;
    }

    playAnimation(images) {
        this.img = this.imageCache[images[this.currentImage % images.length]];
        this.currentImage++;
    }

    /**
     * Prüft, ob der Character von oben auf einen Enemy springt.
     */
    isJumpingOn(enemy) {
        const charBox = this.getCollisionBox();
        const charPrevBox = {
            x: this.prevX,
            y: this.prevY,
            w: this.width,
            h: this.height
        };
        const enemyBox = enemy.getCollisionBox();

        const horizontalOverlap =
            charBox.x + charBox.w > enemyBox.x &&
            charBox.x < enemyBox.x + enemyBox.w;

        const wasAbove = (charPrevBox.y + charPrevBox.h) <= (enemyBox.y + 15);
        const nowTouchesTop =
            (charBox.y + charBox.h) >= enemyBox.y &&
            (charPrevBox.y + charPrevBox.h) <= (enemyBox.y + 40);

        const movingDown = this.speedY < 0;

        return horizontalOverlap && wasAbove && nowTouchesTop && movingDown;
    }
}
