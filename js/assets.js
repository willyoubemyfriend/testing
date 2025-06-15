export const playerImg = new Image();
playerImg.src = 'assets/player.png';

export const tileset = new Image();
tileset.src = 'assets/tileset.png';

export const inventoryImg = new Image();
inventoryImg.src = 'assets/inventory.png';

export const playerImage = new Image();
playerImage.src = 'assets/player_image.png';

export const enemyIcons = new Image();
enemyIcons.src = 'assets/enemy_icons.png';

export const enemyStatusesImg = new Image();
enemyStatusesImg.src = 'assets/enemy_statuses.png';

export const creatureGrid = new Image();
creatureGrid.src = 'assets/creature_grid.png';

export const assets = [playerImg, tileset, inventoryImg, playerImage, enemyIcons, enemyStatusesImg, creatureGrid];

let loaded = 0;

export function loadAssets(callback) {
  assets.forEach(img => {
    img.onload = () => {
      loaded++;
      if (loaded === assets.length) callback();
    };
  });
}
