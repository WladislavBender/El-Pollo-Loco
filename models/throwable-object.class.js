class ThrowableObject extends MovableObject {
    /**
     * Creates a throwable object and initializes its position, size, and direction.
     * @param {number} x - The x position of the object.
     * @param {number} y - The y position of the object.
     * @param {boolean} otherDirection - Whether the object is facing left.
     */
    constructor(x, y, otherDirection) {
        super().loadImage('img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png');
        this.x = x;
        this.y = y;
        this.height = 90;
        this.width = 90;
        this.otherDirection = otherDirection;
        this.throw();
    }

    /**
     * Initiates the throw by setting vertical speed, applying gravity, and moving horizontally.
     */
    throw() {
        this.speedY = 5;
        this.applyGravity();
        setInterval(() => this.moveHorizontally(), 25);
    }

    /**
     * Moves the object horizontally based on its facing direction.
     */
    moveHorizontally() {
        this.x += this.otherDirection ? -10 : 10;
    }
}
