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

    /**
     * Creates a new chicken enemy with randomized position and speed.
     * Loads walking images and starts its animation cycle.
     */
    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.setRandomPositionAndSpeed();
        this.animate();
    }

    /**
     * Sets a random spawn position and speed for the chicken.
     */
    setRandomPositionAndSpeed() {
        this.x = 300 + Math.random() * 2000;
        this.speed = 0.15 + Math.random() * 0.5;
    }

    /**
     * Starts movement and walking animations for the chicken.
     */
    animate() {
        this.startMovement();
        this.startWalkingAnimation();
    }

    /**
     * Starts continuous left movement if the chicken is alive and the game is not paused.
     */
    startMovement() {
        this.movementInterval = setInterval(() => {
            if (this.world && !this.world.paused && this.canMove()) {
                this.moveLeft();
            }
        }, 1000 / 60);
    }

    /**
     * Starts walking animation if the chicken is alive and the game is not paused.
     */
    startWalkingAnimation() {
        this.animationInterval = setInterval(() => {
            if (this.world && !this.world.paused && this.canAnimate()) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    /**
     * Checks if the chicken can still move.
     * @returns {boolean} True if the chicken is not dead.
     */
    canMove() {
        return !this.dead;
    }

    /**
     * Checks if the chicken can still animate.
     * @returns {boolean} True if the chicken is not dead.
     */
    canAnimate() {
        return !this.dead;
    }

    /**
     * Handles the death of the chicken by stopping animations and movement.
     */
    die() {
        this.dead = true;
        this.loadImage(this.IMAGE_DEAD[0]);
        this.speed = 0;
        if (this.movementInterval) clearInterval(this.movementInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
    }
}
