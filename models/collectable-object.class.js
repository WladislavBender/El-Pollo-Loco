/* =================== CollectableObject Class =================== */
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

    /* =================== Initialization =================== */

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

    /* =================== Type Checks =================== */

    /**
     * Checks if the object is a bottle.
     * @returns {boolean} True if type is 'bottle'.
     */
    isBottle() {
        return this.type === 'bottle';
    }

    /**
     * Checks if the object is a coin.
     * @returns {boolean} True if type is 'coin'.
     */
    isCoin() {
        return this.type === 'coin';
    }

    /* =================== Bottle Setup =================== */

    /**
     * Configures a bottle with size and random image.
     */
    setupBottle() {
        this.height = 110;
        this.width = 110;
        const randomImg = this.getRandomBottleImage();
        this.loadImage(randomImg);
    }

    /**
     * Returns a random bottle image from the bottle images array.
     * @returns {string} Random bottle image path.
     */
    getRandomBottleImage() {
        return this.IMAGES_COLLECTABLE_BOTTLES[
            Math.floor(Math.random() * this.IMAGES_COLLECTABLE_BOTTLES.length)
        ];
    }

    /* =================== Coin Setup =================== */

    /**
     * Configures a coin with size and animation.
     */
    setupCoin() {
        this.height = 180;
        this.width = 180;
        this.loadImage(this.IMAGES_COLLECTABLE_COINS[0]);
        this.loadImages(this.IMAGES_COLLECTABLE_COINS);
        this.animateCoins();
    }

    /**
     * Starts coin rotation animation.
     */
    animateCoins() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_COLLECTABLE_COINS);
        }, 200);
    }
}
