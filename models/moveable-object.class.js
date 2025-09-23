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
     * Returns the collision box depending on object type.
     * @returns {{ x:number, y:number, w:number, h:number }} Collision box.
     */
    getCollisionBox() {
        if (this instanceof Character) return this.getCharacterCollisionBox();
        if (this instanceof Endboss) return this.getEndbossCollisionBox();
        if (this instanceof ThrowableObject) return this.getBottleCollisionBox();
        if (this instanceof Chicken || this instanceof ChickenSmall) return this.getChickenCollisionBox();
        if (this.type === 'coin') return this.getCoinCollisionBox();
        if (this.type === 'bottle') return this.getBottleCollectableCollisionBox();
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * Returns collision box for Character.
     */
    getCharacterCollisionBox() {
        const offsetX = 45, offsetYTop = 180, offsetYBottom = 0;
        return this.buildBox(offsetX, offsetYTop, offsetX, offsetYBottom);
    }

    /**
     * Returns collision box for Endboss.
     */
    getEndbossCollisionBox() {
        const offsetX = 50, offsetYTop = 40, offsetYBottom = 20;
        return this.buildBox(offsetX, offsetYTop, offsetX, offsetYBottom);
    }

    /**
     * Returns collision box for a flying bottle.
     */
    getBottleCollisionBox() {
        const marginX = this.safeMargin(this.width, 0.15);
        const marginY = this.safeMargin(this.height, 0.15);
        return this.buildSafeBox(marginX, marginY);
    }

    /**
     * Returns collision box for chickens.
     */
    getChickenCollisionBox() {
        const offsetX = 5, offsetYTop = 15, offsetYBottom = 15;
        return this.buildBox(offsetX, offsetYTop, offsetX, offsetYBottom);
    }

    /**
     * Returns collision box for coins.
     */
    getCoinCollisionBox() {
        const offset = 65;
        return this.buildBox(offset, offset, offset, offset);
    }

    /**
     * Returns collision box for collectable bottles.
     */
    getBottleCollectableCollisionBox() {
        const marginX = this.width * 0.35;
        const marginY = this.height * 0.35;
        return this.buildBox(marginX, marginY, marginX, marginY);
    }

    /**
     * Checks collision with another movable object.
     * @param {MovableObject} mo - Other object.
     * @returns {boolean}
     */
    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox ? mo.getCollisionBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks collision with a collectable object.
     * @param {MovableObject} mo - Collectable object.
     * @returns {boolean}
     */
    isCollidingCollectable(mo) {
        if (mo.type === 'coin') return this.boxesOverlap(this.getCollisionBox(), mo.getCollisionBox());
        if (mo.type === 'bottle' && !(mo instanceof ThrowableObject)) return this.checkBottleCollectCollision(mo);
        return false;
    }

    /**
     * Checks if two collision boxes overlap.
     * @param {{x:number,y:number,w:number,h:number}} a
     * @param {{x:number,y:number,w:number,h:number}} b
     * @returns {boolean}
     */
    boxesOverlap(a, b) {
        return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
    }

    /**
     * Starts gravity loop.
     */
    applyGravity() {
        setInterval(() => { if (this.shouldApplyGravity()) this.applyVerticalMovement(); }, 100 / 25);
        this.prevY = this.y;
    }

    /**
     * Determines if gravity should apply.
     * @returns {boolean}
     */
    shouldApplyGravity() { return this.isAboveGround() || this.speedY > 0; }

    /**
     * Applies vertical movement from gravity.
     */
    applyVerticalMovement() { this.y -= this.speedY; this.speedY -= this.acceleration; }

    /** Moves right. */
    moveRight() { this.x += this.speed; }

    /** Moves left. */
    moveLeft() { this.x -= this.speed; }

    /** Jumps upwards. */
    jump() { this.speedY = 6; }

    /**
     * Applies damage depending on attacker type.
     * @param {Object} attacker - Attacking object.
     */
    hit(attacker) {
        if (this instanceof Character) return;
        let dmg = attacker instanceof Endboss ? 0 : 1;
        this.energy = Math.max(0, this.energy - dmg);
        if (!this.isDead()) this.lastHit = new Date().getTime();
    }

    /** @returns {boolean} True if hurt in the last 1.5s. */
    isHurt() { return (new Date().getTime() - this.lastHit) / 1000 < 1.5; }

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
     * Checks if character is jumping on enemy.
     * @param {MovableObject} enemy - Enemy object.
     * @returns {boolean}
     */
    isJumpingOn(enemy) {
        const charBox = this.getCollisionBox();
        const charPrevBox = { x: this.prevX, y: this.prevY, w: this.width, h: this.height };
        const enemyBox = enemy.getCollisionBox();
        return this.hasHorizontalOverlap(charBox, enemyBox) &&
               this.wasAboveEnemy(charPrevBox, enemyBox) &&
               this.nowTouchesEnemyTop(charBox, charPrevBox, enemyBox) &&
               this.isMovingDown();
    }

    /** Checks horizontal overlap. */
    hasHorizontalOverlap(charBox, enemyBox) { return charBox.x + charBox.w > enemyBox.x && charBox.x < enemyBox.x + enemyBox.w; }

    /** Checks if character was above enemy. */
    wasAboveEnemy(prevBox, enemyBox) { return prevBox.y + prevBox.h <= enemyBox.y + 15; }

    /** Checks if character touches enemy top. */
    nowTouchesEnemyTop(charBox, prevBox, enemyBox) {
        return charBox.y + charBox.h >= enemyBox.y && prevBox.y + prevBox.h <= enemyBox.y + 40;
    }

    /** Checks if character is moving downwards. */
    isMovingDown() { return this.speedY < 0; }

    /** Builds a box with offsets. */
    buildBox(left, top, right, bottom) {
        return { x: this.x + left, y: this.y + top, w: this.width - left - right, h: this.height - top - bottom };
    }

    /** Builds a safe collision box with margins. */
    buildSafeBox(marginX, marginY) {
        return { x: this.x + marginX, y: this.y + marginY, w: Math.max(2, this.width - marginX * 2), h: Math.max(2, this.height - marginY * 2) };
    }

    /** Ensures safe margin size. */
    safeMargin(size, ratio) { return Math.max(6, Math.round(size * ratio)); }

    /** Checks bottle collect collision. */
    checkBottleCollectCollision(mo) {
        const charBox = this.getCollisionBox();
        const collBox = mo.getCollisionBox();
        const charCenterX = this.centerX(charBox);
        const bottleCenterX = this.centerX(collBox);
        return this.boxesOverlap(charBox, collBox) && Math.abs(charCenterX - bottleCenterX) < collBox.w / 2;
    }

    /** Returns center x of a box. */
    centerX(box) { return box.x + box.w / 2; }
}
