class ChickenSmall extends Chicken {
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    IMAGE_DEAD = [
        'img/3_enemies_chicken/chicken_small/2_dead/dead.png'
    ];

    /**
     * Creates a new instance of a small chicken enemy.
     * Initializes its size, position, movement speed, and animations.
     */
    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.height = 60;
        this.width = 80;
        this.y = 370;
        this.setRandomPositionAndSpeed();
        this.animate();
    }
}
