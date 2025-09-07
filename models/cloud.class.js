class Cloud extends MovableObject {
    y = 20;
    height = 250;
    width = 500;

    IMAGES_CLOUDS = [
        'img/5_background/layers/4_clouds/1.png',
        'img/5_background/layers/4_clouds/2.png'
    ];

    static nextImageIndex = 0;
    static lastX = 0;

    constructor() {
        super();
        this.loadImages(this.IMAGES_CLOUDS);
        this.setInitialImage();
        this.setInitialPosition();
        this.animate();
    }

    setInitialImage() {
        let imageIndex = Cloud.nextImageIndex % this.IMAGES_CLOUDS.length;
        this.loadImage(this.IMAGES_CLOUDS[imageIndex]);
        Cloud.nextImageIndex++;
    }

    setInitialPosition() {
        this.x = Cloud.lastX;
        Cloud.lastX += this.width;
    }

    animate() {
        setInterval(() => {
            this.moveLeft();
            if (this.isOutOfView()) {
                this.recycleCloud();
            }
        }, 1000 / 60);
    }

    isOutOfView() {
        return this.x + this.width < 0;
    }

    recycleCloud() {
        this.x = Cloud.lastX;
        Cloud.lastX += this.width;
        this.setInitialImage();
    }
}