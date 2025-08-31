class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;




    // loadImage('img/test.png');
    loadImage(path) {
        this.img = new Image(); // this.img = document.getElementById('image') <img id="image" src>
        this.img.src = path;
    }


    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }


    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken) {
            // Äußerer Debug-Rahmen (blau)
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();

            // Klassenspezifische Offsets
            let offsetX, offsetYTop, offsetYBottom;

            if (this instanceof Character) {
                offsetX = 20;
                offsetYTop = 120;   // stark nach unten versetzt
                offsetYBottom = 20; // unten nur wenig abgeschnitten
            }

            if (this instanceof Chicken) {
                offsetX = 10;
                offsetYTop = 10;    // fast volle Höhe
                offsetYBottom = 10; // unten leicht gekürzt
            }

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
    }







    /**
   * 
   * @param {Array} arr - ['img/image1-png', 'img/image2-png', ...]
   */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}