class StatusBar extends DrawableObject {
    IMAGES_HEALTH = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    IMAGES_COINS = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png'
    ];

    IMAGES_BOTTLES = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png'
    ];

    IMAGES_ENDBOSS = [
        'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    percentageHealth = 100;
    percentageCoins = 0;
    percentageBottles = 0;
    percentageEndboss = 100;

    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTH);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);
        this.loadImages(this.IMAGES_ENDBOSS);
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 60;
    }

    setPercentage(type, percentage) {
        if (type === 'health') {
            this.percentageHealth = percentage;
        } else if (type === 'coins') {
            this.percentageCoins = percentage;
        } else if (type === 'bottles') {
            this.percentageBottles = percentage;
        } else if (type === 'endboss') {
            this.percentageEndboss = percentage;
        }
    }


    resolveImageIndex(percentage) {
        if (percentage >= 100) return 5;
        if (percentage > 80) return 4;
        if (percentage > 60) return 3;
        if (percentage > 40) return 2;
        if (percentage > 20) return 1;
        return 0;
    }


    draw(ctx) {
        // Character Health-Bar (links)
        let healthPath = this.IMAGES_HEALTH[this.resolveImageIndex(this.percentageHealth)];
        ctx.drawImage(this.imageCache[healthPath], this.x, this.y, this.width, this.height);

        // Coins-Bar
        let coinsPath = this.IMAGES_COINS[this.resolveImageIndex(this.percentageCoins)];
        ctx.drawImage(this.imageCache[coinsPath], this.x, this.y + this.height - 10, this.width, this.height);

        // Bottles-Bar
        let bottlesPath = this.IMAGES_BOTTLES[this.resolveImageIndex(this.percentageBottles)];
        ctx.drawImage(this.imageCache[bottlesPath], this.x, this.y + (this.height - 10) * 2, this.width, this.height);

        // 👉 Endboss-Bar (rechts oben im Canvas)
        let bossPath = this.IMAGES_ENDBOSS[this.resolveImageIndex(this.percentageEndboss)];
        ctx.drawImage(this.imageCache[bossPath], 500, 0, this.width, this.height);
        // 500 kannst du an Canvas-Breite anpassen → z.B. canvas.width - this.width - 20
    }

}
