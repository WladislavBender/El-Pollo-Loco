class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 55;
    dead = false;
    inAlert = false;
    inAttack = false;
    moving = false;
    direction = -100;
    energy = 100; // 5 Treffer à 20%

    // Steuerung für Death-Sequenz
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
        'img/4_enemie_boss_chicken/5_dead/G26.png',
    ];

    constructor() {
        super(); // erst super(), dann this.*
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);

        this.x = 2500;
        this.animate();
    }

    // Boss nimmt 20 Schaden pro Flasche + setzt lastHit (triggert Hurt-Anim)
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
        }, 1000);
    }

    startMoving() {
        this.moving = true;
    }

    startAttack() {
        this.inAttack = true;
        setTimeout(() => this.inAttack = false, 1000);
    }

    animate() {
        setInterval(() => {
            // Während der Death-Sequenz keine normale Animation mehr
            if (this.dead) return;

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

    /**
     * Startet die Death-Sequenz (nur einmal). Stoppt alle anderen Zustände,
     * spielt die Dead-Frames genau einmal durch und ruft danach onFinished().
     */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;

        // Zustand einfrieren
        this.dead = true;
        this.speed = 0;
        this.inAlert = false;
        this.inAttack = false;
        this.moving = false;
        this.direction = 0;

        // Death-Animation einmalig abspielen
        this.playDeathAnimation(onFinished);
    }

    playDeathAnimation(onFinished) {
        if (this.deathAnimationPlayed) {
            if (onFinished) onFinished();
            return;
        }
        this.deathAnimationPlayed = true;

        let i = 0;
        const frameTime = 200; // ms pro Frame (wie deine anderen Animationen)
        const interval = setInterval(() => {
            // Schutz: Falls Bilder noch nicht geladen, trotzdem wechseln
            const path = this.IMAGES_DEAD[i];
            this.img = this.imageCache[path] || this.img;

            i++;
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(interval);
                // auf letztem Frame stehen bleiben
                const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
                this.img = this.imageCache[lastPath] || this.img;

                // ganz kleiner Puffer, damit das letzte Frame sicher gerendert wurde
                setTimeout(() => onFinished && onFinished(), 50);
            }
        }, frameTime);
    }
}
