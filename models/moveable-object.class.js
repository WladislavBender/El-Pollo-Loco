class MovableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 0.1;
    energy = 100;
    lastHit = 0;

    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 135;
        }
    }


    getCollisionBox() {
        let x = this.x;
        let y = this.y;
        let w = this.width;
        let h = this.height;

        if (this instanceof Character) {
            let offsetX = 20;
            let offsetYTop = 120;
            let offsetYBottom = 20;

            x = this.x + offsetX;
            y = this.y + offsetYTop;
            w = this.width - offsetX * 2;
            h = this.height - offsetYTop - offsetYBottom;
        }

        return { x, y, w, h };
    }

    /**
     * Kollisionsabfrage mit Gegnern
     * - Character → roter Rahmen
     * - Gegner → voller Rahmen
     */
    isColliding(mo) {
        const a = this.getCollisionBox();
        const b = mo.getCollisionBox ? mo.getCollisionBox() : { x: mo.x, y: mo.y, w: mo.width, h: mo.height };

        return (
            a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h
        );
    }

    /**
     * Kollisionsabfrage mit Collectables (Coins, Bottles)
     * - Character → roter Rahmen
     * - Collectable → voller Rahmen
     */
    isCollidingCollectable(mo) {
        const a = this.getCollisionBox(); // Character (roter Rahmen)
        const b = { x: mo.x, y: mo.y, w: mo.width, h: mo.height }; // Collectable (voller Rahmen)

        return (
            a.x + a.w > b.x &&
            a.x < b.x + b.w &&
            a.y + a.h > b.y &&
            a.y < b.y + b.h
        );
    }

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 100 / 25);
    }

    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1.5;
    }

    isDead() {
        return this.energy == 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
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