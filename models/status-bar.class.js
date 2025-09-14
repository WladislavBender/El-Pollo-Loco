/* =================== StatusBar Class =================== */
class StatusBar extends DrawableObject {
    /* =================== Properties =================== */
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

    endbossVisible = false; // ⬅️ Standardmäßig unsichtbar
    endbossAlpha = 0;       // ⬅️ Start-Transparenz

    /* =================== Initialization =================== */

    constructor() {
        super();
        this.loadAllImages();
        this.setDimensions();
    }

    /**
     * Loads all status bar images into cache.
     */
    loadAllImages() {
        this.loadImages(this.IMAGES_HEALTH);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);
        this.loadImages(this.IMAGES_ENDBOSS);
    }

    /**
     * Sets the dimensions and base position of the status bars.
     */
    setDimensions() {
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 60;
    }

    /* =================== Logic =================== */

    /**
     * Updates the percentage value for a given bar type.
     * @param {'health' | 'coins' | 'bottles' | 'endboss'} type - Type of status bar.
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
     * Resolves the correct image index based on percentage.
     * @param {number} percentage - Value between 0 and 100.
     * @returns {number} Index for image array.
     */
    resolveImageIndex(percentage) {
        if (percentage >= 100) return 5;
        if (percentage > 80) return 4;
        if (percentage > 60) return 3;
        if (percentage > 40) return 2;
        if (percentage > 20) return 1;
        return 0;
    }

    /* =================== Rendering =================== */

    /**
     * Draws all status bars onto the canvas.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     */
    draw(ctx) {
        this.drawBar(ctx, this.IMAGES_HEALTH, this.percentageHealth, this.x, this.y);
        this.drawBar(ctx, this.IMAGES_COINS, this.percentageCoins, this.x, this.y + this.height - 10);
        this.drawBar(ctx, this.IMAGES_BOTTLES, this.percentageBottles, this.x, this.y + (this.height - 10) * 2);

        // Endboss-Bar nur, wenn sichtbar oder im Fade-In
        if (this.endbossVisible || this.endbossAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.endbossAlpha;
            this.drawBar(ctx, this.IMAGES_ENDBOSS, this.percentageEndboss, 500, 0);
            ctx.restore();
        }
    }

    /**
     * Draws a single status bar at given coordinates.
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     * @param {string[]} images - Array of image paths.
     * @param {number} percentage - Percentage value (0–100).
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    drawBar(ctx, images, percentage, x, y) {
        const index = this.resolveImageIndex(percentage);
        const path = images[index];
        ctx.drawImage(this.imageCache[path], x, y, this.width, this.height);
    }

    /* =================== Endboss Bar Handling =================== */

    /**
     * Makes the Endboss bar visible and starts fade-in animation.
     */
    showEndbossBar() {
        this.endbossVisible = true;
        this.animateEndbossFadeIn();
    }

    /**
     * Fades in the Endboss bar smoothly.
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
