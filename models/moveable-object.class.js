class MovableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 0.1;
    energy = 100;
    lastHit = 0;



    isAboveGround() {
        if (this instanceof ThrowableObject) { // ThrowableObjects should always fall
            return true;
        } else {
            return this.y < 135;
        }
    }


    isColliding(mo) {
        // Standard: Gegner / Character
        let offsetX = 0;
        let offsetYTop = 0;
        let offsetYBottom = 0;

        if (this instanceof Character) {
            offsetX = 20;
            offsetYTop = 120;
            offsetYBottom = 20;
        }

        if (this instanceof Chicken) {
            offsetX = 10;
            offsetYTop = 10;
            offsetYBottom = 10;
        }

        let aX = this.x + offsetX;
        let aY = this.y + offsetYTop;
        let aW = this.width - offsetX * 2;
        let aH = this.height - offsetYTop - offsetYBottom;

        return (
            aX + aW > mo.x &&
            aX < mo.x + mo.width &&
            aY + aH > mo.y &&
            aY < mo.y + mo.height
        );
    }


    isCollidingCollectable(mo) {
        // Character soll IMMER mit seinem roten Rahmen geprüft werden
        let offsetX = 20;
        let offsetYTop = 120;
        let offsetYBottom = 20;

        let aX = this.x + offsetX;
        let aY = this.y + offsetYTop;
        let aW = this.width - offsetX * 2;
        let aH = this.height - offsetYTop - offsetYBottom;

        // Collectables → voller äußerer Rahmen (kein Offset!)
        return (
            aX + aW > mo.x &&
            aX < mo.x + mo.width &&
            aY + aH > mo.y &&
            aY < mo.y + mo.height
        );
    }





    // Optional aber sinnvoll (Timing): vorher 100/25 war 4ms
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 100 / 25); // **ÄNDERUNG (optional)**
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
        let timepassed = new Date().getTime() - this.lastHit; // Difference in ms
        timepassed = timepassed / 1000; //Difference in s
        return timepassed < 1.5;
    }

    isDead() {
        return this.energy == 0;
    }


    playAnimation(images) {
        let i = this.currentImage % images.length; // let i = 0 % 6 => 1, Rest 1
        // i = 0, 1, 2, 3, 4, 5, 6, 0
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