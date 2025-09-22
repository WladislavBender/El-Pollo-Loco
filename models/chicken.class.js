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
     * Creates a new chicken with random position and speed.
     * Loads walking images and starts animations.
     */
    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.setRandomPositionAndSpeed();
        this.animate();
    }

    /**
     * Sets a random x-position and movement speed.
     */
    setRandomPositionAndSpeed() {
        this.x = 300 + Math.random() * 2000;
        this.speed = 0.15 + Math.random() * 0.5;
    }

    /**
     * Starts all chicken animations.
     */
    animate() {
        this.startMovement();
        this.startWalkingAnimation();
    }

    /**
     * Continuously moves chicken left if alive and game not paused.
     */
    startMovement() {
        this.movementInterval = setInterval(() => {
            if (this.isActive()) this.moveLeft();
        }, 1000 / 60);
    }

    /**
     * Plays walking animation if alive and game not paused.
     */
    startWalkingAnimation() {
        this.animationInterval = setInterval(() => {
            if (this.isActive()) this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }

    /**
     * Returns true if chicken can move or animate.
     * @returns {boolean}
     */
    isActive() {
        return this.world && !this.world.paused && !this.dead;
    }

    /**
     * Kills chicken, stops animations and movement.
     */
    die() {
        this.dead = true;
        this.loadImage(this.IMAGE_DEAD[0]);
        this.speed = 0;
        this.stopIntervals();
    }

    /**
     * Clears all active intervals for movement and animation.
     */
    stopIntervals() {
        if (this.movementInterval) clearInterval(this.movementInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
    }
}
