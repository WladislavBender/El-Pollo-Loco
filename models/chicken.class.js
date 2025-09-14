/* =================== Chicken Class =================== */
class Chicken extends MovableObject {
    dead = false;
    y = 350;
    height = 80;
    width = 110;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGE_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    /* =================== Initialization =================== */

    /**
     * Creates a new chicken enemy with random position and speed.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.setRandomPositionAndSpeed();
        this.animate();
    }

    /**
     * Assigns a random position and movement speed to the chicken.
     */
    setRandomPositionAndSpeed() {
        this.x = 300 + Math.random() * 2000;
        this.speed = 0.15 + Math.random() * 0.5;
    }

    /* =================== Animation Loop =================== */

    /**
     * Starts the movement and walking animation of the chicken.
     */
    animate() {
        this.startMovement();
        this.startWalkingAnimation();
    }

    /**
     * Moves the chicken left continuously if alive.
     */
    startMovement() {
        setInterval(() => {
            if (this.canMove()) this.moveLeft();
        }, 1000 / 60);
    }

    /**
     * Plays the walking animation if the chicken is alive.
     */
    startWalkingAnimation() {
        setInterval(() => {
            if (this.canAnimate()) this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }

    /* =================== State Checks =================== */

    /**
     * Checks if the chicken can move.
     * @returns {boolean} True if not dead.
     */
    canMove() {
        return !this.dead;
    }

    /**
     * Checks if the chicken can animate.
     * @returns {boolean} True if not dead.
     */
    canAnimate() {
        return !this.dead;
    }
}
