class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 0.1;
    energy = 100;
    lastHit = 0;

    isAboveGround() {
        return this instanceof ThrowableObject || this.y < 135;
    }

    getCollisionBox() {
        if (this instanceof Character) return this.getCharacterCollisionBox();
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

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

    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox ? mo.getCollisionBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    isCollidingCollectable(mo) {
        const a = this.getCollisionBox();
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height };
        return this.boxesOverlap(a, b);
    }

    boxesOverlap(a, b) {
        return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
    }

    applyGravity() {
        setInterval(() => {
            if (this.shouldApplyGravity()) this.applyVerticalMovement();
        }, 100 / 25);
    }

    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    applyVerticalMovement() {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }

    hit() {
        this.energy = Math.max(0, this.energy - 5);
        if (!this.isDead()) this.lastHit = new Date().getTime();
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

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 6;
    }
}