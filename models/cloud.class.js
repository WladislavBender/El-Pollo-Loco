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

    /**
     * Creates a new cloud, initializes its image, position, and starts animation.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_CLOUDS);
        this.setInitialImage();
        this.setInitialPosition();
        this.animate();
    }

    /**
     * Sets the initial image for the cloud, alternating between available images.
     */
    setInitialImage() {
        const imageIndex = Cloud.nextImageIndex % this.IMAGES_CLOUDS.length;
        this.loadImage(this.IMAGES_CLOUDS[imageIndex]);
        Cloud.nextImageIndex++;
    }

    /**
     * Sets the initial X position based on the last cloud’s position.
     */
    setInitialPosition() {
        this.x = Cloud.lastX;
        Cloud.lastX += this.width;
    }

    /**
     * Starts the continuous movement and recycling animation of the cloud.
     */
    animate() {
        setInterval(() => this.updateCloud(), 1000 / 60);
    }

    /**
     * Updates the cloud's position and recycles it if it moves out of view.
     */
    updateCloud() {
        this.moveLeft();
        if (this.isOutOfView()) this.recycleCloud();
    }

    /**
     * Checks if the cloud is out of the viewport.
     * @returns {boolean} True if the cloud is completely out of view.
     */
    isOutOfView() {
        return this.x + this.width < 0;
    }

    /**
     * Recycles the cloud by resetting its position and assigning a new image.
     */
    recycleCloud() {
        this.x = Cloud.lastX;
        Cloud.lastX += this.width;
        this.setInitialImage();
    }
}
