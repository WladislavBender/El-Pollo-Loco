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
            // Character-Box enger machen, vor allem unten,
            // damit man beim "von oben springen" nicht zu früh Schaden nimmt
            const offsetX = 30;       // schmaler, damit die Arme nicht zählen
            const offsetYTop = 110;    // oberer Teil ausblenden (Kopf/Hut/Haare)
            const offsetYBottom = 10; // Füße etwas wegnehmen, damit Bodenkontakt sauber bleibt
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
            // Chickens enger machen → Trefferbereich "Körpermitte"
            const offsetX = 10;       // Seiten wegschneiden (Flügel)
            const offsetYTop = 5;    // oberhalb vom Kopf etwas frei lassen
            const offsetYBottom = 15; // unten freier Bereich, damit Sprung zuverlässiger zählt
            return {
                x: this.x + offsetX,
                y: this.y + offsetYTop,
                w: this.width - offsetX * 2,
                h: this.height - offsetYTop - offsetYBottom
            };
        }

        // Default: volle Box
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }



    /**
     * Gets collision box for Endboss.
     * @returns {{ x:number, y:number, w:number, h:number }} Collision box.
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
     * Gets collision box for ThrowableObject (bottle).
     * @returns {{ x:number, y:number, w:number, h:number }} Collision box.
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
     * @returns {{ x:number, y:number, w:number, h:number }} Collision box.
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
     * Checks collision with another movable object.
     * @param {MovableObject} mo - Another movable object.
     * @returns {boolean} True if colliding.
     */
    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox ? mo.getCollisionBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks collision with a collectable object.
     * @param {DrawableObject} mo - Collectable object.
     * @returns {boolean} True if colliding.
     */
    isCollidingCollectable(mo) {
        const a = this.getCollisionBox();
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks if two collision boxes overlap.
     * @param {{x:number, y:number, w:number, h:number}} a - First box.
     * @param {{x:number, y:number, w:number, h:number}} b - Second box.
     * @returns {boolean} True if overlapping.
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

    /**
     * Checks if gravity should be applied.
     * @returns {boolean} True if above ground or moving vertically.
     */
    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    /**
     * Applies vertical movement (jump/fall).
     */
    applyVerticalMovement() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }

    /**
     * Moves object to the right.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves object to the left.
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Makes the object jump.
     */
    jump() {
        this.speedY = 6;
    }

    /**
     * Applies damage to the object.
     */
    /**
 * Applies damage to the object depending on attacker type.
 * @param {MovableObject} attacker - Enemy that caused the hit.
 */
    hit(attacker) {
        // Character hat eigene Hit-Logik → hier überspringen
        if (this instanceof Character) return;

        let damage = 1;
        if (attacker instanceof Chicken || attacker instanceof ChickenSmall) {
            damage = 1;
        } else if (attacker instanceof Endboss) {
            damage = 0; // nur für andere Objekte relevant
        }

        this.energy = Math.max(0, this.energy - damage);
        if (!this.isDead()) {
            this.lastHit = new Date().getTime();
        }
    }



    /**
     * Checks if object is hurt within 1.5s.
     * @returns {boolean} True if recently hit.
     */
    isHurt() {
        return (new Date().getTime() - this.lastHit) / 1000 < 1.5;
    }

    /**
     * Checks if object is dead.
     * @returns {boolean} True if energy is 0.
     */
    isDead() {
        return this.energy === 0;
    }

    /**
     * Plays an animation sequence.
     * @param {string[]} images - Array of image paths.
     */
    playAnimation(images) {
        this.img = this.imageCache[images[this.currentImage % images.length]];
        this.currentImage++;
    }

    /**
 * Prüft, ob der Character von oben auf einen Enemy springt.
 * @param {Chicken|ChickenSmall} enemy 
 * @returns {boolean}
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
