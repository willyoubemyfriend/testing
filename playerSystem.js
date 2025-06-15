import { TILE_SIZE } from './roomSystem.js';
export function createPlayer(x = 1, y = 1, speed = 1) {
    return {
        x: x,
        y: y,
        px: x * TILE_SIZE,
        py: y * TILE_SIZE,
        speed: speed,
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
            return true; // Movement completed
        }
    }
    return false; // Still moving
}

export function attemptPlayerMovement(player, dx, dy, canMoveCallback) {
    const nx = player.x + dx;
    const ny = player.y + dy;

    if ((dx !== 0 || dy !== 0) && canMoveCallback(nx, ny)) {
        player.x = nx;
        player.y = ny;
        player.moving = true;
        return true;
    }
    return false;
}
