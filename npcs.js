// npcs.js
import { TILE_SIZE } from './roomSystem.js';

export const npcSpritesheet = new Image();
npcSpritesheet.src = 'assets/npc_sprites.png';

export const NPCs = [
    // Format:
    // {
    //   id: number,
    //   name: string,
    //   spriteIndex: number, // x-position in spritesheet (0-based)
    //   rooms: [ { roomIndex, x, y, collidable } ],
    //   dialogue: [] // (to be implemented later)
    // }
    {
        id: 0,
        name: "Lookie",
        spriteIndex: 0,
        rooms: [
            { roomIndex: 0, x: 3, y: 3, collidable: false }
        ]
    },
    {
        id: 1,
        name: "Taciturnip",
        spriteIndex: 1,
        rooms: [
            { roomIndex: 1, x: 5, y: 5, collidable: true },
        ]
    }
];

export function getNPCsInRoom(roomIndex) {
    return NPCs.flatMap(npc => {
        return npc.rooms
            .filter(room => room.roomIndex === roomIndex)
            .map(room => ({ ...npc, ...room }));
    });
}

export function drawNPCs(ctx, roomIndex, npcSpritesheet) {
    const npcs = getNPCsInRoom(roomIndex);
    npcs.forEach(npc => {
        ctx.drawImage(
            npcSpritesheet,
            npc.spriteIndex * TILE_SIZE, 0, // source x, y (top row for now)
            TILE_SIZE, TILE_SIZE,           // source size
            npc.x * TILE_SIZE, npc.y * TILE_SIZE, // position
            TILE_SIZE, TILE_SIZE             // display size
        );
    });
}

export function isNPCCollision(playerX, playerY, roomIndex) {
    const npcs = getNPCsInRoom(roomIndex);
    return npcs.some(npc => 
        npc.collidable && 
        npc.x === playerX && 
        npc.y === playerY
    );
}
