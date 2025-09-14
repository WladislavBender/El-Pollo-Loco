/* =================== MovableObject Class =================== */
class MovableObject extends DrawableObject {
    /* =================== Properties =================== */
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 0.1;
    energy = 100;
    lastHit = 0;

    /* =================== Collision Handling =================== */

    /**
     * Checks if the object is above ground (jumping/falling).
     * @returns {boolean} True if above ground.
     */
    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 135;
    }

    /**
     * Gets the collision box for this object.
     * @returns {{ x: number, y: number, w: number, h: number }} Collision box dimensions.
     */
    getCollisionBox() {
        if (this instanceof Character) return this.getCharacterCollisionBox();
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    /**
     * Calculates the collision box specifically for the Character.
     * @returns {{ x: number, y: number, w: number, h: number }} Collision box dimensions for Character.
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
     * @returns {boolean} True if colliding with collectable.
     */
    isCollidingCollectable(mo) {
        const a = this.getCollisionBox();
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    /**
     * Checks if two collision boxes overlap.
     * @param {{x:number, y:number, w:number, h:number}} a - First collision box.
     * @param {{x:number, y:number, w:number, h:number}} b - Second collision box.
     * @returns {boolean} True if boxes overlap.
     */
    boxesOverlap(a, b) {
        return a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h;
    }

    /* =================== Gravity & Movement =================== */

    /**
     * Continuously applies gravity to the object.
     */
    applyGravity() {
        setInterval(() => {
            if (this.shouldApplyGravity()) this.applyVerticalMovement();
        }, 100 / 25);
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
     * Makes the object jump by applying upward speed.
     */
    jump() {
        this.speedY = 6;
    }

    /* =================== Combat & Damage =================== */

    /**
     * Applies damage to the object.
     */
    hit() {
        this.energy = Math.max(0, this.energy - 5);
        if (!this.isDead()) this.lastHit = new Date().getTime();
    }

    /**
     * Checks if the object is currently hurt (recently hit).
     * @returns {boolean} True if hurt within last 1.5 seconds.
     */
    isHurt() {
        return (new Date().getTime() - this.lastHit) / 1000 < 1.5;
    }

    /**
     * Checks if the object is dead.
     * @returns {boolean} True if energy is 0.
     */
    isDead() {
        return this.energy === 0;
    }

    /* =================== Animation =================== */

    /**
     * Plays an animation sequence by cycling through images.
     * @param {string[]} images - Array of image paths.
     */
    playAnimation(images) {
        this.img = this.imageCache[images[this.currentImage % images.length]];
        this.currentImage++;
    }
}
