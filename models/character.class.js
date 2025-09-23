class Character extends MovableObject {
    height = 300;
    width = 150;
    y = 35;
    speed = 10;
    world;
    lastMoveTime;
    deathSequenceStarted = false;
    deathAnimationPlayed = false;
    isHurtActive = false;
    hurtDuration = 600;
    invincibilityDuration = 50;
    lastHitTime = 0;
    prevY = this.y;

    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/I-1.png', 'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png', 'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png', 'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png', 'img/2_character_pepe/1_idle/idle/I-8.png',
        'img/2_character_pepe/1_idle/idle/I-9.png', 'img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png', 'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png', 'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png', 'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png', 'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png', 'img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png', 'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png', 'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png', 'img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png', 'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png', 'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png', 'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png', 'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/D-51.png', 'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png', 'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png', 'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/H-41.png', 'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    /**
     * Initializes the character with default image, gravity, and animations.
     */
    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadAllImages();
        this.applyGravity();
        this.lastMoveTime = Date.now();
        this.animate();
    }

    /**
     * Loads all image sets for animations.
     */
    loadAllImages() {
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
    }

    /**
     * Starts animation intervals for movement and states.
     */
    animate() {
        setInterval(() => this.handleMovement(), 1000 / 60);
        setInterval(() => this.handleAnimations(), 100);
    }

    /**
     * Handles character movement based on keyboard input.
     */
    handleMovement() {
        if (!this.world?.keyboard) return;
        this.prevY = this.y;
        const kb = this.world.keyboard;
        let moved = this.processHorizontalMovement(kb);
        moved = this.processJump(kb) || moved;
        this.updateCamera();
        if (moved || kb.D) this.updateLastMoveTime();
    }

    /**
     * Processes horizontal movement.
     * @param {Object} kb - Keyboard state.
     * @returns {boolean}
     */
    processHorizontalMovement(kb) {
        if (kb.RIGHT && this.canMoveRight()) return this.moveRightAndFace();
        if (kb.LEFT && this.canMoveLeft()) return this.moveLeftAndFace();
        return false;
    }

    /** Moves right and updates facing direction. */
    moveRightAndFace() {
        this.moveRight();
        this.otherDirection = false;
        return true;
    }

    /** Moves left and updates facing direction. */
    moveLeftAndFace() {
        this.moveLeft();
        this.otherDirection = true;
        return true;
    }

    /**
     * Processes jump input.
     * @param {Object} kb - Keyboard state.
     * @returns {boolean}
     */
    processJump(kb) {
        if (kb.SPACE && this.canJump()) {
            this.jump();
            return true;
        }
        return false;
    }

    /** Updates camera position. */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /** Updates timestamp of last movement. */
    updateLastMoveTime() {
        this.lastMoveTime = Date.now();
    }

    /** @returns {boolean} Whether right movement is allowed. */
    canMoveRight() { return this.x < this.world.level.level_end_x; }

    /** @returns {boolean} Whether left movement is allowed. */
    canMoveLeft() { return this.x > 0; }

    /** @returns {boolean} Whether character can jump. */
    canJump() { return !this.isAboveGround(); }

    /**
     * Handles animation states.
     */
    handleAnimations() {
        if (!this.world?.keyboard) return;
        const kb = this.world.keyboard;
        if (this.isDead()) return;
        if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);
        this.handleGroundAnimations(kb);
    }

    /**
     * Handles ground animations based on movement and idle state.
     * @param {Object} kb - Keyboard state.
     */
    handleGroundAnimations(kb) {
        const now = Date.now();
        const idleTime = now - (this.lastMoveTime || now);
        if (kb.RIGHT || kb.LEFT) return this.playAnimation(this.IMAGES_WALKING);
        if (kb.D) return this.idleOnThrow(now);
        if (idleTime > 5000) return this.playAnimation(this.IMAGES_LONG_IDLE);
        this.playAnimation(this.IMAGES_IDLE);
    }

    /** Plays idle animation while throwing. */
    idleOnThrow(now) {
        this.lastMoveTime = now;
        return this.playAnimation(this.IMAGES_IDLE);
    }

    /** @returns {boolean} Whether character is dead. */
    isDead() { return this.energy <= 0; }

    /**
     * Handles being hit by an attacker.
     * @param {Object} attacker - Enemy or object causing damage.
     */
    hit(attacker) {
        const now = Date.now();
        if (now - this.lastHitTime < this.invincibilityDuration) return;
        const damage = this.calculateDamage(attacker);
        this.energy = Math.max(0, this.energy - damage);
        this.lastHitTime = now;
        this.isHurtActive = true;
        setTimeout(() => this.isHurtActive = false, this.hurtDuration);
    }

    /**
     * Calculates damage based on attacker type.
     * @param {Object} attacker
     * @returns {number}
     */
    calculateDamage(attacker) {
        if (attacker instanceof Chicken || attacker instanceof ChickenSmall) return 1;
        if (attacker instanceof Endboss) return attacker.damage;
        return 5;
    }

    /** @returns {boolean} Whether character is hurt. */
    isHurt() { return this.isHurtActive; }

    /**
     * Starts death sequence.
     * @param {Function} onFinished - Callback when finished.
     */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.speed = 0;
        this.playDeathAnimation(onFinished);
    }

    /**
     * Plays death animation frames.
     * @param {Function} onFinished - Callback when finished.
     */
    playDeathAnimation(onFinished) {
        if (this.deathAnimationPlayed) return onFinished?.();
        this.deathAnimationPlayed = true;
        let i = 0;
        const frameTime = 200;
        const interval = setInterval(() => {
            this.updateDeathFrame(i++);
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(interval);
                this.setFinalDeathFrame(onFinished);
            }
        }, frameTime);
    }

    /**
     * Updates current death frame.
     * @param {number} index
     */
    updateDeathFrame(index) {
        const path = this.IMAGES_DEAD[index];
        this.img = this.imageCache[path] || this.img;
    }

    /**
     * Sets final death frame and triggers callback.
     * @param {Function} onFinished
     */
    setFinalDeathFrame(onFinished) {
        const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
        this.img = this.imageCache[lastPath] || this.img;
        setTimeout(() => onFinished?.(), 500);
    }
}
