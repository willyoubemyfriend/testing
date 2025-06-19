import { TILE_SIZE } from './roomSystem.js';

export const NPC_SPRITESHEET_PATH = 'assets/npc_sprites.png';
export const npcSpritesheet = new Image();
npcSpritesheet.src = NPC_SPRITESHEET_PATH;

export const NPCs = [
    {
        id: 0,
        name: "Lookie",
        spriteIndex: 0, // First sprite in the sheet
        rooms: [
            { roomIndex: 0, x: 3, y: 3, collidable: false }
        ],
        dialogue: [
            "HI GOOD MORNING YOU ARE IN HELL",
            "I WANT LEMONS CAKE FRUIT CRACKERS BEEF TONGUE SWEAT",
            "WHEAT ICE SAUCE LIVER EYES SALT WEEDS",
            "FINGER BREAST GOAT PEPPER TEARS VEINS NERVES",
            "I'm overcome by DESIRE... I can't take it."
        ]
    },
    {
        id: 1,
        name: "Taciturnip",
        spriteIndex: 1, // Second sprite in the sheet
        rooms: [
            { roomIndex: 1, x: 5, y: 5, collidable: true }
        ],
        dialogue: [
            "Did you see that?",
            "That space between this room and the next?",
            "I mean, jeez... talk about bad architecture."
        ]
    },
    {
        id: 2,
        name: "Blucas",
        spriteIndex: 2, // Third sprite in the sheet
        rooms: [
            { roomIndex: 2, x: 4, y: 4, collidable: true }
        ],
        dialogue: [
            "Please help",
            "I've been trapped in this dungeon for hours",
            "There's nothing to do in here",
            "That guy in the other room took the rest of me",
            "Sick and twisted asshole"
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

export function drawNPCs(ctx, roomIndex, npcSpritesheet, player, keys) {
    const npcs = getNPCsInRoom(roomIndex);

    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;
    
    npcs.forEach(npc => {
        // Draw NPC sprite
        ctx.drawImage(
            npcSpritesheet,
            npc.spriteIndex * TILE_SIZE, 0,
            TILE_SIZE, TILE_SIZE,
            npc.x * TILE_SIZE, npc.y * TILE_SIZE,
            TILE_SIZE, TILE_SIZE
        );

        // Draw "Z" prompt when player is facing NPC

        ctx.fillStyle = "white";
        ctx.font = '8px "Press Start 2P"';
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        
        const isAdjacent = (
            (Math.abs(player.x - npc.x) === 1 && player.y === npc.y) || // Left/right
            (Math.abs(player.y - npc.y) === 1 && player.x === npc.x)    // Up/down
        );
        
        if (isAdjacent && npc.dialogue) {
            ctx.fillStyle = "white";
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = "center";
            ctx.fillText("Z", npc.x * TILE_SIZE + 8, npc.y * TILE_SIZE - 8);
            ctx.textAlign = "left";
        }
    });
    
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
}

export function drawNPCsInTransition(ctx, roomIndex, offsetX, offsetY, npcSpritesheet) {
    const npcs = getNPCsInRoom(roomIndex);
    npcs.forEach(npc => {
        ctx.drawImage(
            npcSpritesheet,
            npc.spriteIndex * TILE_SIZE, 0,
            TILE_SIZE, TILE_SIZE,
            npc.x * TILE_SIZE + offsetX,
            npc.y * TILE_SIZE + offsetY,
            TILE_SIZE, TILE_SIZE
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
