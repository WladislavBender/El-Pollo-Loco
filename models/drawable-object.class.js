class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;
    debugFrames = false;

    /**
     * Loads a single image and assigns it to this object.
     * @param {string} path - Path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads multiple images into the image cache.
     * @param {string[]} arr - Array of image paths.
     */
    loadImages(arr) {
        arr.forEach((path) => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Draws the object on the given canvas context.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws debug frames (blue + red) if debug mode is enabled.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     */
    drawFrame(ctx) {
        if (this.debugFrames && (this.isCharacter() || this.isChicken() || this.isCoin() || this.isBottle())) {
            this.drawBlueFrame(ctx);
            this.drawRedFrame(ctx);
        }
    }

    /**
     * Checks if the object is an instance of Character.
     * @returns {boolean} True if instance of Character.
     */
    isCharacter() {
        return this instanceof Character;
    }

    /**
     * Checks if the object is an instance of Chicken.
     * @returns {boolean} True if instance of Chicken.
     */
    isChicken() {
        return this instanceof Chicken;
    }

    /**
     * Checks if the object is a coin.
     * @returns {boolean} True if type is 'coin'.
     */
    isCoin() {
        return this.type === 'coin';
    }

    /**
     * Checks if the object is a bottle.
     * @returns {boolean} True if type is 'bottle'.
     */
    isBottle() {
        return this.type === 'bottle';
    }

    /**
     * Draws the blue frame representing the object’s full size.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     */
    drawBlueFrame(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'blue';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    /**
     * Draws the red frame representing the collision box.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     */
    drawRedFrame(ctx) {
        const { newX, newY, newW, newH } = this.getCollisionBox();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.rect(newX, newY, newW, newH);
        ctx.stroke();
    }

    /**
     * Calculates the collision box dimensions based on offsets.
     * @returns {{ newX: number, newY: number, newW: number, newH: number }} Collision box dimensions.
     */
    getCollisionBox() {
        const { offsetX, offsetYTop, offsetYBottom } = this.getOffsets();
        return {
            newX: this.x + offsetX,
            newY: this.y + offsetYTop,
            newW: this.width - offsetX * 2,
            newH: this.height - offsetYTop - offsetYBottom
        };
    }

    /**
     * Gets offsets for collision boxes depending on object type.
     * @returns {{ offsetX: number, offsetYTop: number, offsetYBottom: number }} Offsets for collision detection.
     */
    getOffsets() {
        if (this.isCharacter()) return { offsetX: 20, offsetYTop: 30, offsetYBottom: 20 };
        if (this.isChicken()) return { offsetX: 10, offsetYTop: 10, offsetYBottom: 10 };
        if (this.isCoin()) return { offsetX: 25, offsetYTop: 25, offsetYBottom: 25 };
        if (this.isBottle()) return { offsetX: 5, offsetYTop: 5, offsetYBottom: 5 };
        return { offsetX: 0, offsetYTop: 0, offsetYBottom: 0 };
    }
}
