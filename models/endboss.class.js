class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 55;
    dead = false;
    inAlert = false;   // NEU
    inAttack = false;  // NEU
    moving = false;    // NEU
    direction = -100;    // -1 = links, +1 = rechts

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
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 2500;
        this.animate();
    }

    startAlert() {
        this.inAlert = true;
        setTimeout(() => {
            this.inAlert = false;
            this.startMoving();
        }, 1000); // 2 Sek. Alarm-Animation, danach Bewegung
    }

    startMoving() {
        this.moving = true;
    }

    startAttack() {
        this.inAttack = true;
        setTimeout(() => this.inAttack = false, 1000); // Attack dauert 1 Sek.
    }

    animate() {
        setInterval(() => {
            if (this.dead) {
                this.playAnimation(this.IMAGES_DEAD);
                return;
            }
            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.inAlert) {
                this.playAnimation(this.IMAGES_ALERT);
            } else if (this.inAttack) {
                this.playAnimation(this.IMAGES_ATTACK);
            } else if (this.moving) {
                this.playAnimation(this.IMAGES_WALKING);
                this.moveBetween();
            }
        }, 200);
    }

    moveBetween() {
        this.x += this.speed * this.direction;
        if (this.x <= 2000) this.direction = 10;
        if (this.x >= 2500) this.direction = -10;
    }
}