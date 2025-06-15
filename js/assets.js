const playerImg = new Image();
playerImg.src = 'assets/player.png';

const tileset = new Image();
tileset.src = 'assets/tileset.png';

const inventoryImg = new Image();
inventoryImg.src = 'assets/inventory.png';

const playerImage = new Image();
playerImage.src = 'assets/player_image.png';

const enemyIcons = new Image();
enemyIcons.src = 'assets/enemy_icons.png';

const enemyStatusesImg = new Image();
enemyStatusesImg.src = 'assets/enemy_statuses.png';

const creatureGrid = new Image();
creatureGrid.src = 'assets/creature_grid.png';

const assets = [playerImg, tileset, inventoryImg, playerImage, enemyIcons, enemyStatusesImg, creatureGrid];

let assetsLoaded = 0;

export function loadAssets(callback) {
  assets.forEach(img => {
    img.onload = () => {
      loaded++;
      if (loaded === assets.length) callback();
    };
  });
}
