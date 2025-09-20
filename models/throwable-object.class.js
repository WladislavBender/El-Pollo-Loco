class ThrowableObject extends MovableObject {
    constructor(x, y, otherDirection) {
        super().loadImage('img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png');
        this.x = x;
        this.y = y;
        this.height = 90;
        this.width = 90;
        this.otherDirection = otherDirection; // Blickrichtung übernehmen
        this.throw();
    }

    throw() {
        this.speedY = 5;
        this.applyGravity();
        setInterval(() => {
            if (this.otherDirection) {
                // nach links
                this.x -= 10;
            } else {
                // nach rechts
                this.x += 10;
            }
        }, 25);
    }
}
