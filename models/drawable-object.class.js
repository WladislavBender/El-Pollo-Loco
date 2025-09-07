class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this.isCharacter() || this.isChicken()) {
            this.drawBlueFrame(ctx);
            this.drawRedFrame(ctx);
        }
    }

    isCharacter() {
        return this instanceof Character;
    }

    isChicken() {
        return this instanceof Chicken;
    }

    drawBlueFrame(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'blue';
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    drawRedFrame(ctx) {
        let { offsetX, offsetYTop, offsetYBottom } = this.getOffsets();
        const newX = this.x + offsetX;
        const newY = this.y + offsetYTop;
        const newW = this.width - offsetX * 2;
        const newH = this.height - offsetYTop - offsetYBottom;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.rect(newX, newY, newW, newH);
        ctx.stroke();
    }

    getOffsets() {
        if (this.isCharacter()) {
            return { offsetX: 20, offsetYTop: 120, offsetYBottom: 20 };
        }
        if (this.isChicken()) {
            return { offsetX: 10, offsetYTop: 10, offsetYBottom: 10 };
        }
        return { offsetX: 0, offsetYTop: 0, offsetYBottom: 0 };
    }
}
