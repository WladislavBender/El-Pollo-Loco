/* =================== Endboss Class =================== */
class Endboss extends MovableObject {
    /* =================== Properties =================== */
    height = 400;
    width = 250;
    y = 55;
    x = 2500;
    energy = 100;
    direction = -100;
    speed = 0.25; // <-- etwas schneller als vorher (0.15)

    dead = false;
    inAlert = false;
    inAttack = false;
    inHurt = false; // <-- neuer Zustand
    moving = false;

    deathSequenceStarted = false;
    deathAnimationPlayed = false;

    hitCounter = 0; // <-- zählt die Treffer

    /* =================== Image Assets =================== */
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

    /* =================== Constructor =================== */
    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    /* =================== Combat & Damage =================== */
    /**
     * Reduces Endboss energy when hit.
     * Only every 2nd hit counts!
     */
    hit() {
        this.hitCounter++;

        if (this.hitCounter % 2 === 0) {
            this.energy -= 20;
            if (this.energy < 0) this.energy = 0;
        }

        this.lastHit = new Date().getTime();
        this.inHurt = true;

        // Hurt-Zustand nur sehr kurz aktiv (300ms)
        setTimeout(() => {
            this.inHurt = false;
        }, 300);
    }

    /**
     * Gibt zurück, ob der Endboss gerade in Hurt-Animation ist.
     */
    isHurt() {
        return this.inHurt;
    }

    /**
     * Checks if the Endboss is dead.
     * @returns {boolean} True if energy is depleted or already dead.
     */
    isDead() {
        return this.energy <= 0 || this.dead;
    }

    /* =================== State Handling =================== */
    startAlert(statusBar) {
        this.inAlert = true;
        if (statusBar) statusBar.showEndbossBar();
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

    isInAlert() {
        return this.inAlert;
    }

    isInAttack() {
        return this.inAttack;
    }

    isMoving() {
        return this.moving;
    }

    /* =================== Animation & Movement =================== */
    animate() {
        setInterval(() => {
            if (this.isDead()) return;
            this.handleAnimationState();
        }, 200);
    }

    handleAnimationState() {
        if (this.isInAlert()) this.playAnimation(this.IMAGES_ALERT);
        else if (this.isHurt()) this.playAnimation(this.IMAGES_HURT);
        else if (this.isInAttack()) this.playAnimation(this.IMAGES_ATTACK);
        else if (this.isMoving()) {
            this.playAnimation(this.IMAGES_WALKING);
            this.moveBetween();
        }
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

    /* =================== Death Handling =================== */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.resetStatesOnDeath();
        this.playDeathAnimation(onFinished);
    }

    resetStatesOnDeath() {
        this.dead = true;
        this.speed = 0;
        this.inAlert = false;
        this.inAttack = false;
        this.inHurt = false;
        this.moving = false;
        this.direction = 0;
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
                this.setFinalDeathFrame(onFinished);
            }
        }, frameTime);
    }

    setFinalDeathFrame(onFinished) {
        const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
        this.img = this.imageCache[lastPath] || this.img;
        setTimeout(() => onFinished && onFinished(), 50);
    }
}
