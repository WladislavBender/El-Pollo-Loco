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
     * Loads a single image.
     * @param {string} path - Image source path.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads multiple images into the cache.
     * @param {string[]} arr - List of image paths.
     */
    loadImages(arr) {
        arr.forEach((path) => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Draws the object on canvas.
     * @param {CanvasRenderingContext2D} ctx - Rendering context.
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws the debug frame if enabled.
     * @param {CanvasRenderingContext2D} ctx - Rendering context.
     */
    drawFrame(ctx) {
        if (this.debugFrames && this.shouldShowFrame()) {
            this.drawRedFrame(ctx);
        }
    }

    /**
     * Checks if this object should show a debug frame.
     * @returns {boolean}
     */
    shouldShowFrame() {
        return this.isCharacter() || this.isChicken() || this.isCoin() || this.isBottle();
    }

    /**
     * Determines if object is a character.
     * @returns {boolean}
     */
    isCharacter() {
        return this instanceof Character;
    }

    /**
     * Determines if object is a chicken.
     * @returns {boolean}
     */
    isChicken() {
        return this instanceof Chicken;
    }

    /**
     * Determines if object is a coin.
     * @returns {boolean}
     */
    isCoin() {
        return this.type === "coin";
    }

    /**
     * Determines if object is a bottle.
     * @returns {boolean}
     */
    isBottle() {
        return this.type === "bottle";
    }

    /**
     * Draws a red frame around the collision box.
     * @param {CanvasRenderingContext2D} ctx - Rendering context.
     */
    drawRedFrame(ctx) {
        const { x, y, w, h } = this.getCollisionBox();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }

    /**
     * Returns the collision box based on offsets.
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getCollisionBox() {
        const { offsetX, offsetYTop, offsetYBottom } = this.getOffsets();
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
    }

    /**
     * Provides offsets depending on object type.
     * @returns {{offsetX:number, offsetYTop:number, offsetYBottom:number}}
     */
    getOffsets() {
        if (this.isCharacter()) return { offsetX: 20, offsetYTop: 30, offsetYBottom: 50 };
        if (this.isChicken()) return { offsetX: 10, offsetYTop: 10, offsetYBottom: 10 };
        if (this.isCoin()) return { offsetX: 10, offsetYTop: 10, offsetYBottom: 10 };
        if (this.isBottle()) return { offsetX: 3, offsetYTop: 3, offsetYBottom: 3 };
        return { offsetX: 0, offsetYTop: 0, offsetYBottom: 0 };
    }
}
