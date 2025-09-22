class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;
    debugFrames = true;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws only the red debug frame if debug mode is enabled.
     */
    drawFrame(ctx) {
        if (this.debugFrames && (this.isCharacter() || this.isChicken() || this.isCoin() || this.isBottle())) {
            this.drawRedFrame(ctx); // nur noch die rote Box
        }
    }

    isCharacter() {
        return this instanceof Character;
    }

    isChicken() {
        return this instanceof Chicken;
    }

    isCoin() {
        return this.type === 'coin';
    }

    isBottle() {
        return this.type === 'bottle';
    }

    drawRedFrame(ctx) {
        const { x, y, w, h } = this.getCollisionBox();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.rect(x, y, w, h);
        ctx.stroke();
    }


    getCollisionBox() {
        const { offsetX, offsetYTop, offsetYBottom } = this.getOffsets();
        return {
            x: this.x + offsetX,
            y: this.y + offsetYTop,
            w: this.width - offsetX * 2,
            h: this.height - offsetYTop - offsetYBottom
        };
    }


    getOffsets() {
        if (this.isCharacter()) return { offsetX: 20, offsetYTop: 30, offsetYBottom: 50 };
        if (this.isChicken()) return { offsetX: 10, offsetYTop: 10, offsetYBottom: 10 };
        if (this.isCoin()) return { offsetX: 25, offsetYTop: 25, offsetYBottom: 25 };
        if (this.isBottle()) return { offsetX: 5, offsetYTop: 5, offsetYBottom: 5 };
        return { offsetX: 0, offsetYTop: 0, offsetYBottom: 0 };
    }
}
