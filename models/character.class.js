class Character extends MovableObject {
    height = 300;
    width = 150;
    y = 35;
    speed = 10;
    world;
    lastMoveTime;
    deathSequenceStarted = false;
    deathAnimationPlayed = false;

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
     * Initializes the character with images, gravity, and animation.
     */
    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadAllImages();
        this.applyGravity();
        this.lastMoveTime = new Date().getTime();

        // <-- neue Variable zum Vergleichen der vorherigen Y-Position
        this.prevY = this.y;

        this.animate();
    }


    /**
     * Loads all image sets for character animations.
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
     * Starts animation intervals for movement and state animations.
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
        let moved = false;
        moved = this.processHorizontalMovement(kb) || moved;
        moved = this.processJump(kb) || moved;
        this.updateCamera();
        if (moved || kb.D) this.updateLastMoveTime();
    }

    /**
     * Processes horizontal movement.
     * @param {Object} kb - Keyboard state.
     * @returns {boolean} Whether movement occurred.
     */
    processHorizontalMovement(kb) {
        if (kb.RIGHT && this.canMoveRight()) {
            this.moveRight();
            this.otherDirection = false;
            return true;
        }
        if (kb.LEFT && this.canMoveLeft()) {
            this.moveLeft();
            this.otherDirection = true;
            return true;
        }
        return false;
    }

    /**
     * Processes jump movement.
     * @param {Object} kb - Keyboard state.
     * @returns {boolean} Whether jump occurred.
     */
    processJump(kb) {
        if (kb.SPACE && this.canJump()) {
            this.jump();
            return true;
        }
        return false;
    }

    /**
     * Updates camera position relative to character.
     */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Updates timestamp of the last movement.
     */
    updateLastMoveTime() {
        this.lastMoveTime = new Date().getTime();
    }

    /**
     * Checks if movement to the right is allowed.
     * @returns {boolean}
     */
    canMoveRight() {
        return this.x < this.world.level.level_end_x;
    }

    /**
     * Checks if movement to the left is allowed.
     * @returns {boolean}
     */
    canMoveLeft() {
        return this.x > 0;
    }

    /**
     * Checks if character can jump.
     * @returns {boolean}
     */
    canJump() {
        return !this.isAboveGround();
    }

    /**
     * Handles animation states based on conditions.
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
     * Handles animations when character is on the ground.
     * @param {Object} kb - Keyboard state.
     */
    handleGroundAnimations(kb) {
        const now = new Date().getTime();
        const timeSinceMove = now - (this.lastMoveTime || now);
        if (kb.RIGHT || kb.LEFT) return this.playAnimation(this.IMAGES_WALKING);
        if (kb.D) {
            this.lastMoveTime = now;
            return this.playAnimation(this.IMAGES_IDLE);
        }
        if (timeSinceMove > 5000) return this.playAnimation(this.IMAGES_LONG_IDLE);
        this.playAnimation(this.IMAGES_IDLE);
    }

    /**
     * Checks if character is dead.
     * @returns {boolean}
     */
    isDead() {
        return this.energy <= 0;
    }

    /**
     * Starts death sequence and animation.
     * @param {Function} onFinished - Callback after death animation.
     */
    startDeath(onFinished) {
        if (this.deathSequenceStarted) return;
        this.deathSequenceStarted = true;
        this.speed = 0;
        this.playDeathAnimation(onFinished);
    }

    /**
     * Plays death animation frames.
     * @param {Function} onFinished - Callback after animation.
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
            this.updateDeathFrame(i);
            i++;
            if (i >= this.IMAGES_DEAD.length) {
                clearInterval(interval);
                this.setFinalDeathFrame(onFinished);
            }
        }, frameTime);
    }

    /**
     * Updates current death frame image.
     * @param {number} index - Frame index.
     */
    updateDeathFrame(index) {
        const path = this.IMAGES_DEAD[index];
        this.img = this.imageCache[path] || this.img;
    }

    /**
     * Sets final death frame and triggers callback.
     * @param {Function} onFinished - Callback after frame.
     */
    setFinalDeathFrame(onFinished) {
        const lastPath = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
        this.img = this.imageCache[lastPath] || this.img;
        setTimeout(() => onFinished && onFinished(), 500);
    }
}
