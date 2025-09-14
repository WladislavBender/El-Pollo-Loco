/* =================== Character Class =================== */
class Character extends MovableObject {
    height = 300;
    width = 150;
    y = 35;
    speed = 10;
    world;
    lastMoveTime;

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
        'img/2_character_pepe/2_walk/W-26.png'
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

    /* =================== Initialization =================== */

    /**
     * Creates a new character and initializes images, gravity, and animations.
     */
    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadAllImages();
        this.applyGravity();
        this.lastMoveTime = new Date().getTime();
        this.animate();
    }

    /**
     * Loads all character image sets into the cache.
     */
    loadAllImages() {
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
    }

    /* =================== Animation Loop =================== */

    /**
     * Starts the animation loop for movement and image changes.
     */
    animate() {
        setInterval(() => this.handleMovement(), 1000 / 60);
        setInterval(() => this.handleAnimations(), 50);
    }

    /* =================== Movement =================== */

    /**
     * Handles movement input and updates character position.
     */
    handleMovement() {
        if (!this.world?.keyboard) return;
        const kb = this.world.keyboard;
        let moved = false;

        if (kb.RIGHT && this.canMoveRight()) {
            this.moveRight();
            this.otherDirection = false;
            moved = true;
        }

        if (kb.LEFT && this.canMoveLeft()) {
            this.moveLeft();
            this.otherDirection = true;
            moved = true;
        }

        if (kb.SPACE && this.canJump()) {
            this.jump();
            moved = true;
        }

        this.updateCamera();
        if (moved || kb.D) this.updateLastMoveTime();
    }

    /**
     * Updates camera position relative to character.
     */
    updateCamera() {
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Updates the last movement time to the current time.
     */
    updateLastMoveTime() {
        this.lastMoveTime = new Date().getTime();
    }

    /**
     * Checks if the character can move to the right.
     * @returns {boolean} True if character is within world bounds.
     */
    canMoveRight() {
        return this.x < this.world.level.level_end_x;
    }

    /**
     * Checks if the character can move to the left.
     * @returns {boolean} True if x > 0.
     */
    canMoveLeft() {
        return this.x > 0;
    }

    /**
     * Checks if the character can perform a jump.
     * @returns {boolean} True if character is on the ground.
     */
    canJump() {
        return !this.isAboveGround();
    }

    /* =================== Animation States =================== */

    /**
     * Handles character animations depending on state (idle, walking, jumping, etc.).
     */
    handleAnimations() {
        if (!this.world?.keyboard) return;
        const kb = this.world.keyboard;

        if (this.isDead()) return this.playAnimation(this.IMAGES_DEAD);
        if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);

        this.handleGroundAnimations(kb);
    }

    /**
     * Handles animations when character is on the ground.
     * @param {object} kb - Keyboard input object.
     */
    handleGroundAnimations(kb) {
        const now = new Date().getTime();
        const timeSinceMove = now - (this.lastMoveTime || now);

        if (kb.RIGHT || kb.LEFT) {
            this.playAnimation(this.IMAGES_WALKING);
        } else if (kb.D) {
            this.lastMoveTime = now;
            this.playAnimation(this.IMAGES_IDLE);
        } else if (timeSinceMove > 3000) {
            this.playAnimation(this.IMAGES_LONG_IDLE);
        } else {
            this.playAnimation(this.IMAGES_IDLE);
        }
    }
}
