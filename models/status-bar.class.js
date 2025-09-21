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

    endbossVisible = false;
    endbossAlpha = 0;

    /**
     * Creates a new StatusBar and initializes images and size.
     */
    constructor() {
        super();
        this.loadAllImages();
        this.setDimensions();
    }

    /**
     * Loads all images for status bars.
     */
    loadAllImages() {
        this.loadImages(this.IMAGES_HEALTH);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);
        this.loadImages(this.IMAGES_ENDBOSS);
    }

    /**
     * Sets default dimensions and position.
     */
    setDimensions() {
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 60;
    }

    /**
     * Updates percentage of a specific bar type.
     * @param {'health'|'coins'|'bottles'|'endboss'} type - Status bar type.
     * @param {number} percentage - Value between 0 and 100.
     */
    setPercentage(type, percentage) {
        const mapping = {
            health: 'percentageHealth',
            coins: 'percentageCoins',
            bottles: 'percentageBottles',
            endboss: 'percentageEndboss'
        };
        if (mapping[type]) this[mapping[type]] = percentage;
    }

    /**
     * Resolves image index from percentage.
     * @param {number} percentage - Value between 0 and 100.
     * @returns {number} Index in image array.
     */
    resolveImageIndex(percentage) {
        const p = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
        if (p === 0) return 0;
        if (p <= 20) return 1;
        if (p <= 40) return 2;
        if (p <= 60) return 3;
        if (p <= 80) return 4;
        return 5;
    }

    /**
     * Draws all status bars.
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
        this.drawBar(ctx, this.IMAGES_HEALTH, this.percentageHealth, this.x, this.y);
        this.drawBar(ctx, this.IMAGES_COINS, this.percentageCoins, this.x, this.y + this.height - 10);
        this.drawBar(ctx, this.IMAGES_BOTTLES, this.percentageBottles, this.x, this.y + (this.height - 10) * 2);
        if (this.endbossVisible || this.endbossAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.endbossAlpha;
            this.drawBar(ctx, this.IMAGES_ENDBOSS, this.percentageEndboss, 500, 0);
            ctx.restore();
        }
    }

    /**
     * Draws a single status bar.
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     * @param {string[]} images - Image paths.
     * @param {number} percentage - Value between 0 and 100.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     */
    drawBar(ctx, images, percentage, x, y) {
        const index = this.resolveImageIndex(percentage);
        const path = images[index];
        const img = this.imageCache[path];
        if (img) ctx.drawImage(img, x, y, this.width, this.height);
    }

    /**
     * Shows Endboss bar and triggers fade-in.
     */
    showEndbossBar() {
        this.endbossVisible = true;
        this.animateEndbossFadeIn();
    }

    /**
     * Fades in the Endboss bar.
     */
    animateEndbossFadeIn() {
        let fadeInterval = setInterval(() => {
            this.endbossAlpha += 0.05;
            if (this.endbossAlpha >= 1) {
                this.endbossAlpha = 1;
                clearInterval(fadeInterval);
            }
        }, 50);
    }
}
