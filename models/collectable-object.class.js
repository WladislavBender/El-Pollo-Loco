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

    constructor(type, x, y) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;

        if (this.isBottle()) this.setupBottle();
        if (this.isCoin()) this.setupCoin();
    }

    isBottle() {
        return this.type === 'bottle';
    }

    isCoin() {
        return this.type === 'coin';
    }

    setupBottle() {
        this.height = 110;
        this.width = 110;
        let randomImg = this.IMAGES_COLLECTABLE_BOTTLES[
            Math.floor(Math.random() * this.IMAGES_COLLECTABLE_BOTTLES.length)
        ];
        this.loadImage(randomImg);
    }

    setupCoin() {
        this.height = 180;
        this.width = 180;
        this.loadImage(this.IMAGES_COLLECTABLE_COINS[0]);
        this.loadImages(this.IMAGES_COLLECTABLE_COINS);
        this.animateCoins();
    }

    animateCoins() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_COLLECTABLE_COINS);
        }, 200);
    }
}