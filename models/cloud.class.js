class Cloud extends MovableObject {
    y = 20;
    height = 250;
    width = 500;

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    static nextImageIndex = 0;    // Welches Bild ist als nächstes dran?
    static lastX = 0;             // Merkt sich die rechte Kante der letzten Cloud

    constructor() {
        super();
        this.loadImages(this.IMAGES_CLOUDS);

        // Bild abwechselnd wählen (1.png, 2.png, 1.png, 2.png …)
        let imageIndex = Cloud.nextImageIndex % this.IMAGES_CLOUDS.length;
        this.loadImage(this.IMAGES_CLOUDS[imageIndex]);
        Cloud.nextImageIndex++;

        // Position direkt rechts neben der letzten Cloud
        this.x = Cloud.lastX;
        Cloud.lastX += this.width;

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();

            // Wenn die Cloud ganz aus dem Bild raus ist →
            // wieder rechts anhängen für Endlos-Schleife
            if (this.x + this.width < 0) {
                this.x = Cloud.lastX;
                Cloud.lastX += this.width;

                // Beim Recycling auch Bild abwechseln
                let imageIndex = Cloud.nextImageIndex % this.IMAGES_CLOUDS.length;
                this.loadImage(this.IMAGES_CLOUDS[imageIndex]);
                Cloud.nextImageIndex++;
            }
        }, 1000 / 60); // 60 FPS
    }
}
