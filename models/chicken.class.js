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
        super().loadImage(this.IMAGES_WALKING[0]);
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
        this.startAnimation();
    }

    startMovement() {
        setInterval(() => {
            if (this.canMove()) this.moveLeft();
        }, 1000 / 60);
    }

    startAnimation() {
        setInterval(() => {
            if (this.canAnimate()) this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }

    canMove() { return !this.dead; }
    canAnimate() { return !this.dead; }
}