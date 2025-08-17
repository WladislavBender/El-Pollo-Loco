class Character extends MovableObject {

    height = 300;
    width = 150;
    y = 35;
    speed = 10;

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png',
        'img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png',
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    world;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.animate();

        // Zeitpunkt der letzten Aktivität (Bewegung ODER D-Taste)
        this.lastMoveTime = new Date().getTime();
    }

    animate() {

        // --- Bewegung & Eingaben prüfen ---
        setInterval(() => {
            const kb = this.world?.keyboard;
            if (!kb) return; // world evtl. noch nicht gesetzt

            let moving = false;

            if (kb.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.otherDirection = false;
                moving = true;
            }

            if (kb.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
                moving = true;
            }

            if (kb.SPACE && !this.isAboveGround()) {
                this.jump();
                moving = true;
            }

            // Kamera bewegen
            this.world.camera_x = -this.x + 100;

            // Aktivität erkannt: Bewegung ODER D zum Werfen
            if (moving || kb.D) {
                this.lastMoveTime = new Date().getTime();
            }
        }, 1000 / 60);

        // --- Animationen steuern ---
        setInterval(() => {
            const kb = this.world?.keyboard;
            if (!kb) return;

            if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else {
                // Idle / Long Idle / Walking
                const now = new Date().getTime();
                const timeSinceMove = now - (this.lastMoveTime || now);

                if (kb.RIGHT || kb.LEFT) {
                    // Laufen nur bei Richtungstasten
                    this.playAnimation(this.IMAGES_WALKING);
                } else if (kb.D) {
                    // D gedrückt: keine Long-Idle, Timer wird frisch gehalten
                    this.lastMoveTime = now;
                    this.playAnimation(this.IMAGES_IDLE);
                } else if (timeSinceMove > 3000) {
                    // länger keine Aktivität → Long Idle
                    this.playAnimation(this.IMAGES_LONG_IDLE);
                } else {
                    // Standard → Idle
                    this.playAnimation(this.IMAGES_IDLE);
                }
            }
        }, 50);
    }
}
