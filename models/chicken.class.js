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

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.setRandomPositionAndSpeed();
        this.animate();
    }

    setRandomPositionAndSpeed() {
        this.x = 300 + Math.random() * 2000;
        this.speed = 0.15 + Math.random() * 0.5;
    }

    animate() {
        this.startMovement();
        this.startWalkingAnimation();
    }

    startMovement() {
        this.movementInterval = setInterval(() => {
            if (this.world && !this.world.paused && this.canMove()) this.moveLeft();
        }, 1000 / 60);
    }

    startWalkingAnimation() {
        this.animationInterval = setInterval(() => {
            if (this.world && !this.world.paused && this.canAnimate()) this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }

    canMove() {
        return !this.dead;
    }

    canAnimate() {
        return !this.dead;
    }

    die() {
        this.dead = true;
        this.loadImage(this.IMAGE_DEAD[0]);
        this.speed = 0;

        if (this.movementInterval) clearInterval(this.movementInterval);
        if (this.animationInterval) clearInterval(this.animationInterval);
    }
}
