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
    endbossVisible = false;     // ⬅️ Standardmäßig unsichtbar
    endbossAlpha = 0;           // ⬅️ Start-Transparenz

    constructor() {
        super();
        this.loadAllImages();
        this.setDimensions();
    }

    loadAllImages() {
        this.loadImages(this.IMAGES_HEALTH);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);
        this.loadImages(this.IMAGES_ENDBOSS);
    }

    setDimensions() {
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 60;
    }

    setPercentage(type, percentage) {
        const mapping = {
            health: 'percentageHealth',
            coins: 'percentageCoins',
            bottles: 'percentageBottles',
            endboss: 'percentageEndboss'
        };
        if (mapping[type]) this[mapping[type]] = percentage;
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
        this.drawBar(ctx, this.IMAGES_HEALTH, this.percentageHealth, this.x, this.y);
        this.drawBar(ctx, this.IMAGES_COINS, this.percentageCoins, this.x, this.y + this.height - 10);
        this.drawBar(ctx, this.IMAGES_BOTTLES, this.percentageBottles, this.x, this.y + (this.height - 10) * 2);

        // Endboss-Bar nur, wenn sichtbar
        if (this.endbossVisible || this.endbossAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.endbossAlpha; // Transparenz anwenden
            this.drawBar(ctx, this.IMAGES_ENDBOSS, this.percentageEndboss, 500, 0);
            ctx.restore();
        }
    }


    showEndbossBar() {
        this.endbossVisible = true;
        this.animateEndbossFadeIn();
    }

    animateEndbossFadeIn() {
        let fadeInterval = setInterval(() => {
            this.endbossAlpha += 0.05; // Fade-In Geschwindigkeit
            if (this.endbossAlpha >= 1) {
                this.endbossAlpha = 1;
                clearInterval(fadeInterval);
            }
        }, 50); // alle 50ms transparenter machen
    }

    drawBar(ctx, images, percentage, x, y) {
        const index = this.resolveImageIndex(percentage);
        const path = images[index];
        ctx.drawImage(this.imageCache[path], x, y, this.width, this.height);
    }
}


