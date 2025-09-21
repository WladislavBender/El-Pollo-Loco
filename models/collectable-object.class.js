class CollectableObject extends MovableObject {
    IMAGES_COLLECTABLE_BOTTLES = [
        'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];

    IMAGES_COLLECTABLE_COINS = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    type;

    /**
     * Creates a new collectable object (bottle or coin).
     * @param {string} type - The type of the object ('bottle' or 'coin').
     * @param {number} x - The x position of the object.
     * @param {number} y - The y position of the object.
     */
    constructor(type, x, y) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;
        if (this.isBottle()) this.setupBottle();
        if (this.isCoin()) this.setupCoin();
    }

    /**
     * Checks if the object is a bottle.
     * @returns {boolean} True if the type is 'bottle'.
     */
    isBottle() {
        return this.type === 'bottle';
    }

    /**
     * Checks if the object is a coin.
     * @returns {boolean} True if the type is 'coin'.
     */
    isCoin() {
        return this.type === 'coin';
    }

    /**
     * Configures the bottle with size and random image.
     */
    setupBottle() {
        this.height = 110;
        this.width = 110;
        this.loadImage(this.getRandomBottleImage());
    }

    /**
     * Returns a random bottle image from the bottle images array.
     * @returns {string} A random bottle image path.
     */
    getRandomBottleImage() {
        return this.IMAGES_COLLECTABLE_BOTTLES[
            Math.floor(Math.random() * this.IMAGES_COLLECTABLE_BOTTLES.length)
        ];
    }

    /**
     * Configures the coin with size, images, and starts its animation.
     */
    setupCoin() {
        this.height = 180;
        this.width = 180;
        this.loadImage(this.IMAGES_COLLECTABLE_COINS[0]);
        this.loadImages(this.IMAGES_COLLECTABLE_COINS);
        this.animateCoins();
    }

    /**
     * Starts the coin rotation animation loop.
     */
    animateCoins() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_COLLECTABLE_COINS);
        }, 200);
    }
}
