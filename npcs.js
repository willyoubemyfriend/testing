// npcs.js
import { TILE_SIZE } from './roomSystem.js';

// NPC data structure
export const npcData = [
    {
        id: 0,
        name: "Eyestrom",
        spriteIndex: 0, // Corresponds to position in npc_sprites.png
        room: 0, // Room index where this NPC appears
        x: 3,    // Tile X position
        y: 4,     // Tile Y position
        collidable: true,
        dialogue: ["Back in my day...", "The dungeon wasn't so sticky!"]
    },
    {
        id: 1,
        name: "Taciturnip A",
        spriteIndex: 1,
        room: 1,
        x: 8,
        y: 1,
        collidable: true,
        dialogue: ["I'm not wearing anything under here.", "What? You can't see anything!"]
    },
    {
        id: 2,
        name: "Blooby",
        spriteIndex: 2,
        room: 2,
        x: 4,
        y: 4,
        collidable: false,
        dialogue: ["I'm Blooby!", "I sell nothing... because I'm broke as fuck"]
    }
];

// NPC image
const npcSprites = new Image();
npcSprites.src = 'assets/npc_sprites.png';

export function getNpcsInRoom(roomIndex) {
    return npcData.filter(npc => npc.room === roomIndex);
}

export function canMoveToTile(roomIndex, x, y, ignoreNpcs = false) {
    if (ignoreNpcs) return true;
    
    const npcs = getNpcsInRoom(roomIndex);
    return !npcs.some(npc => 
        npc.collidable && 
        npc.x === x && 
        npc.y === y
    );
}

export function drawNpcs(ctx, roomIndex, offsetX = 0, offsetY = 0) {
    const npcs = getNpcsInRoom(roomIndex);
    npcs.forEach(npc => {
        ctx.drawImage(
            npcSprites,
            npc.spriteIndex * 16, 0, // Source x, y (using first frame)
            16, 16,                  // Source width, height
            npc.x * TILE_SIZE + offsetX,
            npc.y * TILE_SIZE + offsetY,
            TILE_SIZE, TILE_SIZE
        );
    });
}
