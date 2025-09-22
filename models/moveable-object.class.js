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
        if (this instanceof Character) return this.getCharacterCollisionBox();
        if (this instanceof Endboss) return this.getEndbossCollisionBox();
        if (this instanceof ThrowableObject) return this.getBottleCollisionBox();
        if (this instanceof Chicken || this instanceof ChickenSmall) {
            return this.getChickenCollisionBox();
        }
        if (this.type === 'coin') return this.getCoinCollisionBox();
        if (this.type === 'bottle') return this.getBottleCollectableCollisionBox();
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * Gets collision box for Character.
     */
    getCharacterCollisionBox() {
        const offsetX = 30;
        const offsetYTop = 110;
        const offsetYBottom = 10;
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
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
     * Gets collision box for a flying bottle.
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
     * Gets collision box for chickens.
     */
    getChickenCollisionBox() {
        const offsetX = 20;
        const offsetYTop = 5;
        const offsetYBottom = 15;
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
    }

    /**
     * Gets collision box for coins.
     */
    getCoinCollisionBox() {
        const offset = 60;
        return {
            x: this.x + offset,
            y: this.y + offset,
            w: this.width - offset * 2,
            h: this.height - offset * 2
        };
    }

    /**
     * Gets collision box for collectable bottles.
     */
    getBottleCollectableCollisionBox() {
        const offsetX = 40;
        const offsetY = 10;
        return {
            x: this.x + offsetX,
            y: this.y + offsetY,
            w: this.width - offsetX * 2,
            h: this.height - offsetY * 2
        };
    }

    /**
     * Checks collision with another movable object.
     * @param {MovableObject} mo - Other object.
     * @returns {boolean}
     */
    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox
            ? mo.getCollisionBox()
            : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks collision with a collectable object.
     * @param {Object} mo - Collectable object.
     * @returns {boolean}
     */
    isCollidingCollectable(mo) {
        const a = this.getCollisionBox();
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks if two collision boxes overlap.
     * @param {{x:number,y:number,w:number,h:number}} a
     * @param {{x:number,y:number,w:number,h:number}} b
     * @returns {boolean}
     */
    boxesOverlap(a, b) {
        return (
            a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h
        );
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
     * Determines if gravity should apply.
     * @returns {boolean}
     */
    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    /**
     * Applies vertical movement (gravity effect).
     */
    applyVerticalMovement() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }

    /** Moves object right. */
    moveRight() { this.x += this.speed; }

    /** Moves object left. */
    moveLeft() { this.x -= this.speed; }

    /** Makes object jump. */
    jump() { this.speedY = 6; }

    /**
     * Applies damage to the object depending on attacker type.
     * @param {Object} attacker - The attacking object.
     */
    hit(attacker) {
        if (this instanceof Character) return;
        let damage = 1;
        if (attacker instanceof Endboss) damage = 0;
        this.energy = Math.max(0, this.energy - damage);
        if (!this.isDead()) this.lastHit = new Date().getTime();
    }

    /** @returns {boolean} True if hurt in the last 1.5s. */
    isHurt() {
        return (new Date().getTime() - this.lastHit) / 1000 < 1.5;
    }

    /** @returns {boolean} True if energy is 0. */
    isDead() { return this.energy === 0; }

    /**
     * Plays animation from given images.
     * @param {string[]} images - Array of image paths.
     */
    playAnimation(images) {
        this.img = this.imageCache[images[this.currentImage % images.length]];
        this.currentImage++;
    }

    /**
     * Checks if the character is jumping on top of an enemy.
     * @param {MovableObject} enemy - The enemy object.
     * @returns {boolean}
     */
    isJumpingOn(enemy) {
        const charBox = this.getCollisionBox();
        const charPrevBox = { x: this.prevX, y: this.prevY, w: this.width, h: this.height };
        const enemyBox = enemy.getCollisionBox();
        return (
            this.hasHorizontalOverlap(charBox, enemyBox) &&
            this.wasAboveEnemy(charPrevBox, enemyBox) &&
            this.nowTouchesEnemyTop(charBox, charPrevBox, enemyBox) &&
            this.isMovingDown()
        );
    }

    /**
     * Checks if character overlaps horizontally with enemy.
     */
    hasHorizontalOverlap(charBox, enemyBox) {
        return charBox.x + charBox.w > enemyBox.x &&
               charBox.x < enemyBox.x + enemyBox.w;
    }

    /**
     * Checks if character was above enemy in previous frame.
     */
    wasAboveEnemy(prevBox, enemyBox) {
        return prevBox.y + prevBox.h <= enemyBox.y + 15;
    }

    /**
     * Checks if character now touches enemy top.
     */
    nowTouchesEnemyTop(charBox, prevBox, enemyBox) {
        return (charBox.y + charBox.h) >= enemyBox.y &&
               (prevBox.y + prevBox.h) <= enemyBox.y + 40;
    }

    /**
     * Checks if character is moving down.
     */
    isMovingDown() {
        return this.speedY < 0;
    }
}