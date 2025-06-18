export const assets = {
    playerImg: new Image(),
    tileset: new Image(),
    inventoryImg: new Image(),
    playerImage: new Image(),
    enemyIcons: new Image(),
    enemyStatusesImg: new Image(),
    creatureGrid: new Image(),
    npcSpritesheet: new Image(),
    textboxImg: new Image()
};

export function loadAssets(callback) {
    // Set source paths
    assets.playerImg.src = 'assets/player.png';
    assets.tileset.src = 'assets/tileset.png';
    assets.inventoryImg.src = 'assets/inventory.png';
    assets.playerImage.src = 'assets/player_image.png';
    assets.enemyIcons.src = 'assets/enemy_icons.png';
    assets.enemyStatusesImg.src = 'assets/enemy_statuses.png';
    assets.creatureGrid.src = 'assets/creature_grid.png';
    assets.npcSpritesheet.src = 'assets/npc_sprites.png';
    assets.textboxImg.src = 'assets/textbox.png';

    let loadedCount = 0;
    const totalAssets = Object.keys(assets).length;

    const onAssetLoad = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
            callback();
        }
    };

    // Set load handlers for all assets
    Object.values(assets).forEach(img => {
        img.onload = onAssetLoad;
    });
}
