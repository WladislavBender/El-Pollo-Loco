let level1;

/**
 * Initializes the first level of the game by creating enemies, clouds, and background objects.
 */
function initLevel() {
    level1 = new Level(
        createEnemies(),
        createClouds(),
        createBackgroundObjects()
    );
}

/**
 * Creates the enemies for the level.
 * @returns {Array} An array of enemy objects.
 */
function createEnemies() {
    return [
        new Chicken(),
        new ChickenSmall(),
        new Chicken(),
        new ChickenSmall(),
        new Chicken(),
        new ChickenSmall(),
        new Endboss()
    ];
}

/**
 * Creates the clouds for the level.
 * @returns {Array} An array of cloud objects.
 */
function createClouds() {
    return [new Cloud()];
}

/**
 * Creates the background objects for the level.
 * @returns {Array} An array of background objects.
 */
function createBackgroundObjects() {
    return [
        ...createBackgroundSection(-720, 2),
        ...createBackgroundSection(0, 1),
        ...createBackgroundSection(720, 2),
        ...createBackgroundSection(720 * 2, 1),
        ...createBackgroundSection(720 * 3, 2)
    ];
}

/**
 * Creates a background section with air, third, second, and first layers.
 * @param {number} position - The horizontal offset for the section.
 * @param {number} variant - The variant number (1 or 2) of the layer images.
 * @returns {Array} An array of background objects for one section.
 */
function createBackgroundSection(position, variant) {
    return [
        new BackgroundObject('img/5_background/layers/air.png', position),
        new BackgroundObject(`img/5_background/layers/3_third_layer/${variant}.png`, position),
        new BackgroundObject(`img/5_background/layers/2_second_layer/${variant}.png`, position),
        new BackgroundObject(`img/5_background/layers/1_first_layer/${variant}.png`, position)
    ];
}
