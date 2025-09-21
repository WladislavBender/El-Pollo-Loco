class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_end_x = 2200;

    /**
     * Creates a new level with given enemies, clouds and background objects.
     * @param {Object[]} enemies - Array of enemy objects in the level.
     * @param {Object[]} clouds - Array of cloud objects in the level.
     * @param {Object[]} backgroundObjects - Array of background objects in the level.
     */
    constructor(enemies, clouds, backgroundObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}
