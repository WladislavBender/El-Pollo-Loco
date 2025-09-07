class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 55;
    dead = false;
    inAlert = false;
    inAttack = false;
    moving = false;
    direction = -100;
    energy = 100;
    deathSequenceStarted = false;
    deathAnimationPlayed = false;

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 2500;
        this.animate();
    }

    hit() {
        this.energy -= 20;
        if (this.energy < 0) this.energy = 0;
        this.lastHit = new Date().getTime();
    }

    startAlert() {
        this.inAlert = true;
        setTimeout(() => {
            this.inAlert = false;
            this.startMoving();
        }, 1500);
    }

    startMoving() {
        this.moving = true;
    }

    startAttack() {
        this.inAttack = true;
        setTimeout(() => this.inAttack = false, 1000);
    }

    isDead() {
        return this.energy <= 0 || this.dead;
    }

    isInAlert() {
        return this.inAlert;
    }

    isInAttack() {
        return this.inAttack;
    }

    isMoving() {
        return this.moving;
    }

    animate() {
        setInterval(() => {
            if (this.isDead()) return;
            if (this.isInAlert()) this.playAnimation(this.IMAGES_ALERT);
            else if (this.isHurt()) this.playAnimation(this.IMAGES_HURT);
            else if (this.isInAttack()) this.playAnimation(this.IMAGES_ATTACK);
            else if (this.isMoving()) {
                this.playAnimation(this.IMAGES_WALKING);
                this.moveBetween();
            }
        }, 200);
    }

    moveBetween() {
        this.x += this.speed * this.direction;
        if (this.isAtLeftBoundary()) this.direction = 10;
        if (this.isAtRightBoundary()) this.direction = -10;
    }

    isAtLeftBoundary() {
        return this.x <= 2000;
    }

    isAtRightBoundary() {
        return this.x >= 2500;
    }

    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.dead = true;
        this.speed = 0;
        this.inAlert = false;
        this.inAttack = false;
        this.moving = false;
        this.direction = 0;
        this.playDeathAnimation(onFinished);
    }

    playDeathAnimation(onFinished) {
        if (this.deathAnimationPlayed) {
            if (onFinished) onFinished();
            return;
        }
        this.deathAnimationPlayed = true;
        let i = 0;
        const frameTime = 200;
        const interval = setInterval(() => {
            const path = this.IMAGES_DEAD[i];
            this.img = this.imageCache[path] || this.img;
            i++;
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(interval);
                const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
                this.img = this.imageCache[lastPath] || this.img;
                setTimeout(() => onFinished && onFinished(), 50);
            }
        }, frameTime);
    }
}
