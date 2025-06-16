export const ASSET_PATHS = {
    player: 'assets/player.png',
    tileset: 'assets/tileset.png',
    inventory: 'assets/inventory.png',
    playerImage: 'assets/player_image.png',
    enemyIcons: 'assets/enemy_icons.png',
    enemyStatuses: 'assets/enemy_statuses.png',
    creatureGrid: 'assets/creature_grid.png'
};

export function loadAssets(callback) {
    const playerImg = new Image();
    const tileset = new Image();
    const inventoryImg = new Image();
    const playerImage = new Image();
    const enemyIcons = new Image();
    const enemyStatusesImg = new Image();
    const creatureGrid = new Image();

    playerImg.src = ASSET_PATHS.player;
    tileset.src = ASSET_PATHS.tileset;
    inventoryImg.src = ASSET_PATHS.inventory;
    playerImage.src = ASSET_PATHS.playerImage;
    enemyIcons.src = ASSET_PATHS.enemyIcons;
    enemyStatusesImg.src = ASSET_PATHS.enemyStatuses;
    creatureGrid.src = ASSET_PATHS.creatureGrid;

    const assets = {
        playerImg,
        tileset,
        inventoryImg,
        playerImage,
        enemyIcons,
        enemyStatusesImg,
        creatureGrid
    };

    let assetsLoaded = 0;
    const totalAssets = Object.keys(assets).length;

    Object.values(assets).forEach(img => {
        img.onload = () => {
            assetsLoaded++;
            if (assetsLoaded === totalAssets) {
                callback(assets);
            }
        };
    });

    return assets;
}
