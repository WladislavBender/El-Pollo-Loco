/* =================== Endboss Class =================== */
class Endboss extends MovableObject {
    /* =================== Properties =================== */
    height = 400;
    width = 250;
    y = 55;
    x = 2500;
    energy = 100;
    direction = -100;
    speed = 0;

    dead = false;
    inAlert = false;
    inAttack = false;
    moving = false;

    deathSequenceStarted = false;
    deathAnimationPlayed = false;

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

    /**
     * Initializes the Endboss by loading all required assets.
     */
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
     */
    hit() {
        this.energy -= 20;
        if (this.energy < 0) this.energy = 0;
        this.lastHit = new Date().getTime();
    }

    /**
     * Checks if the Endboss is dead.
     * @returns {boolean} True if energy is depleted or already dead.
     */
    isDead() {
        return this.energy <= 0 || this.dead;
    }

    /* =================== State Handling =================== */

    /**
     * Starts alert state and activates the status bar.
     * @param {object} statusBar - Endboss status bar reference.
     */
    startAlert(statusBar) {
        this.inAlert = true;
        if (statusBar) statusBar.showEndbossBar();
        setTimeout(() => {
            this.inAlert = false;
            this.startMoving();
        }, 1500);
    }

    /**
     * Starts movement of the Endboss.
     */
    startMoving() {
        this.moving = true;
    }

    /**
     * Starts attack animation for a short duration.
     */
    startAttack() {
        this.inAttack = true;
        setTimeout(() => this.inAttack = false, 1000);
    }

    /**
     * @returns {boolean} True if in alert mode.
     */
    isInAlert() {
        return this.inAlert;
    }

    /**
     * @returns {boolean} True if attacking.
     */
    isInAttack() {
        return this.inAttack;
    }

    /**
     * @returns {boolean} True if moving.
     */
    isMoving() {
        return this.moving;
    }

    /* =================== Animation & Movement =================== */

    /**
     * Main animation loop that decides which animation to play.
     */
    animate() {
        setInterval(() => {
            if (this.isDead()) return;
            this.handleAnimationState();
        }, 200);
    }

    /**
     * Handles which animation state should be played.
     */
    handleAnimationState() {
        if (this.isInAlert()) this.playAnimation(this.IMAGES_ALERT);
        else if (this.isHurt()) this.playAnimation(this.IMAGES_HURT);
        else if (this.isInAttack()) this.playAnimation(this.IMAGES_ATTACK);
        else if (this.isMoving()) {
            this.playAnimation(this.IMAGES_WALKING);
            this.moveBetween();
        }
    }

    /**
     * Moves Endboss back and forth between boundaries.
     */
    moveBetween() {
        this.x += this.speed * this.direction;
        if (this.isAtLeftBoundary()) this.direction = 10;
        if (this.isAtRightBoundary()) this.direction = -10;
    }

    /**
     * @returns {boolean} True if at left boundary.
     */
    isAtLeftBoundary() {
        return this.x <= 2000;
    }

    /**
     * @returns {boolean} True if at right boundary.
     */
    isAtRightBoundary() {
        return this.x >= 2500;
    }

    /* =================== Death Handling =================== */

    /**
     * Starts the death sequence and triggers animation.
     * @param {Function} onFinished - Callback after death animation ends.
     */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.resetStatesOnDeath();
        this.playDeathAnimation(onFinished);
    }

    /**
     * Resets all states when Endboss dies.
     */
    resetStatesOnDeath() {
        this.dead = true;
        this.speed = 0;
        this.inAlert = false;
        this.inAttack = false;
        this.moving = false;
        this.direction = 0;
    }

    /**
     * Plays the death animation sequence.
     * @param {Function} onFinished - Callback after animation ends.
     */
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

    /**
     * Sets the last death frame and triggers callback.
     * @param {Function} onFinished - Callback after last frame.
     */
    setFinalDeathFrame(onFinished) {
        const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
        this.img = this.imageCache[lastPath] || this.img;
        setTimeout(() => onFinished && onFinished(), 50);
    }
}
