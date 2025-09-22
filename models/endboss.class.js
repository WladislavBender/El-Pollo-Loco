class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 55;
    x = 2500;
    energy = 80;
    speed = 25;
    direction = 0.25;
    damage = 2;
    dead = false;
    inAlert = false;
    inAttack = false;
    inHurt = false;
    moving = false;
    deathSequenceStarted = false;
    deathAnimationPlayed = false;
    hitCounter = 0;

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

    /**
     * Creates an instance of Endboss and loads images.
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

    /**
     * Applies damage logic to the Endboss.
     */
    hit() {
        this.hitCounter++;
        if (this.hitCounter % 2 === 0) this.reduceEnergy();
        this.lastHit = new Date().getTime();
        this.setHurtState();
    }

    /**
     * Reduces energy by 20 points, prevents negative values.
     */
    reduceEnergy() {
        this.energy -= 20;
        if (this.energy < 0) this.energy = 0;
    }

    /**
     * Activates hurt state for a short duration.
     */
    setHurtState() {
        this.inHurt = true;
        setTimeout(() => this.inHurt = false, 300);
    }

    /**
     * Returns whether the Endboss is currently hurt.
     * @returns {boolean}
     */
    isHurt() {
        return this.inHurt;
    }

    /**
     * Returns whether the Endboss is dead.
     * @returns {boolean}
     */
    isDead() {
        return this.energy <= 0 || this.dead;
    }

    /**
     * Activates alert mode and starts moving after delay.
     * @param {Object} statusBar
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
     * Enables movement state.
     */
    startMoving() {
        this.moving = true;
    }

    /**
     * Starts attack animation for a limited time.
     */
    startAttack() {
        this.inAttack = true;
        setTimeout(() => this.inAttack = false, 1000);
    }

    /**
     * Returns whether the Endboss is in alert state.
     * @returns {boolean}
     */
    isInAlert() {
        return this.inAlert;
    }

    /**
     * Returns whether the Endboss is in attack state.
     * @returns {boolean}
     */
    isInAttack() {
        return this.inAttack;
    }

    /**
     * Returns whether the Endboss is moving.
     * @returns {boolean}
     */
    isMoving() {
        return this.moving;
    }

    /**
     * Handles animation states based on current status.
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
     * Moves the Endboss horizontally within defined bounds.
     */
    moveBetween() {
        if (!this.world || this.world.paused) return;
        this.x += this.speed * this.direction;
        if (this.isAtLeftBoundary()) this.direction = 1;
        if (this.isAtRightBoundary()) this.direction = -1;
    }

    /**
     * Starts animation loop for the Endboss.
     */
    animate() {
        setInterval(() => {
            if (!this.world || this.world.paused) return;
            if (this.isDead()) return;
            this.handleAnimationState();
        }, 200);
    }

    /**
     * Checks if Endboss reached left boundary.
     * @returns {boolean}
     */
    isAtLeftBoundary() {
        return this.x <= 2000;
    }

    /**
     * Checks if Endboss reached right boundary.
     * @returns {boolean}
     */
    isAtRightBoundary() {
        return this.x >= 2500;
    }

    /**
     * Initiates death sequence.
     * @param {Function} onFinished
     */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.resetStatesOnDeath();
        this.playDeathAnimation(onFinished);
    }

    /**
     * Resets all active states when Endboss dies.
     */
    resetStatesOnDeath() {
        this.dead = true;
        this.speed = 0;
        this.inAlert = false;
        this.inAttack = false;
        this.inHurt = false;
        this.moving = false;
        this.direction = 0;
    }

    /**
     * Plays death animation sequence.
     * @param {Function} onFinished
     */
    playDeathAnimation(onFinished) {
        if (this.deathAnimationPlayed) return this.finishDeath(onFinished);
        this.deathAnimationPlayed = true;
        let i = 0;
        const interval = setInterval(() => {
            this.showDeathFrame(i);
            i++;
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(interval);
                this.setFinalDeathFrame(onFinished);
            }
        }, 200);
    }

    /**
     * Displays a single frame of the death animation.
     * @param {number} i
     */
    showDeathFrame(i) {
        const path = this.IMAGES_DEAD[i];
        this.img = this.imageCache[path] || this.img;
    }

    /**
     * Ensures final frame is shown and callback executed.
     * @param {Function} onFinished
     */
    setFinalDeathFrame(onFinished) {
        const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
        this.img = this.imageCache[lastPath] || this.img;
        setTimeout(() => onFinished && onFinished(), 50);
    }

    /**
     * Completes death sequence if already played.
     * @param {Function} onFinished
     */
    finishDeath(onFinished) {
        if (onFinished) onFinished();
    }
}
