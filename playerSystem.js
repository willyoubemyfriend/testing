import { TILE_SIZE } from './roomSystem.js';

export function createPlayer() {
    return {
        x: 1,
        y: 1,
        px: 1 * TILE_SIZE,
        py: 1 * TILE_SIZE,
        speed: 1,
        moving: false
    };
}

export function createPlayerStats() {
    return {
        name: "Googar",
        hp: 50,
        maxhp: 50,
        attack: 5,
        defense: 5,
        dread: 15,
        location: "Ö CUM DUNGEON",
        description: "So cold, so cold, oh, so cold..."
    };
}

export function updatePlayerPosition(player) {
    if (player.moving) {
        const tx = player.x * TILE_SIZE;
        const ty = player.y * TILE_SIZE;

        if (player.px < tx) player.px += player.speed;
        if (player.px > tx) player.px -= player.speed;
        if (player.py < ty) player.py += player.speed;
        if (player.py > ty) player.py -= player.speed;

        if (Math.abs(player.px - tx) < player.speed && Math.abs(player.py - ty) < player.speed) {
            player.px = tx;
            player.py = ty;
            player.moving = false;
            return true; // Indicates movement completed
        }
    }
    return false;
}

export function drawPlayer(ctx, player, playerImg) {
    ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);
}
