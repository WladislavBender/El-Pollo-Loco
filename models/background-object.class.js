class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;

    /**
     * Creates a new background object with given image and position.
     * @param {string} imagePath - Path to the background image.
     * @param {number} x - The x position of the background object.
     * @param {number} y - The y position of the background object.
     */
    constructor(imagePath, x, y) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}
