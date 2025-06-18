import { 
    TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, 
    rooms, roomExits, 
    drawRoom, canMove 
} from './roomSystem.js';

import {
    createInventory,
    toggleInventory,
    changeInventoryPage,
    updateInventoryPosition,
    drawInventoryPage1,
    drawInventoryPage3
} from './inventorySystem.js';

import {
    createPlayer,
    createPlayerStats,
    updatePlayerPosition,
    drawPlayer
} from './playerSystem.js';

import { 
    npcSpritesheet,
    drawNPCs,
    isNPCCollision,
    drawNPCsInTransition,
    getNPCsInRoom
} from './npcs.js';

import { 
    textboxImg,
    createDialogueSystem,
    startDialogue,
    updateDialogue,
    advanceDialogue,
    drawDialogue,
    DIALOGUE_STATE
} from './dialogueSystem.js';

import { assets, loadAssets } from './assetLoader.js';

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Initialize game state
const playerStats = createPlayerStats();
const seenEnemies = Array(28).fill(true);
const enemyStatuses = Array(28).fill("newlife");

let currentRoomIndex = 0;
let gameState = {
    mode: 'overworld',
    canMove: true
};

let enemyAnimTimer = 0;
let enemyAnimFrame = 0;
const enemyAnimInterval = 250;

let player = createPlayer();
let inventory = createInventory();

let roomTransition = {
    active: false,
    direction: null,
    progress: 0,
    speed: 4,
    fromRoom: null,
    toRoom: null,
    playerStartX: 0,
    playerStartY: 0,
    roomGap: 0
};

let dialogueSystem = createDialogueSystem();

// Input handling
const keys = {};
window.addEventListener("keydown", (e) => {
    if (!keys[e.key]) handleKeyPress(e.key);
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function handleKeyPress(key) {
    // Dialogue advancement
    if (dialogueSystem.state !== DIALOGUE_STATE.INACTIVE) {
        if (key === "z") advanceDialogue(dialogueSystem);
        return;
    }

    // NEW: Z-to-talk when facing NPC
    if (key === "z") {
        const npcs = getNPCsInRoom(currentRoomIndex);
        const facingX = player.x + (keys["ArrowRight"] ? 1 : keys["ArrowLeft"] ? -1 : 0);
        const facingY = player.y + (keys["ArrowDown"] ? 1 : keys["ArrowUp"] ? -1 : 0);
        
        const npc = npcs.find(n => n.x === facingX && n.y === facingY);
        if (npc?.dialogue) startDialogue(dialogueSystem, npc.dialogue);
    }

    if (key === "i") toggleInventory(inventory, canvas, gameState);

    if (gameState.mode === 'inventory' && !inventory.transitioning) {
        if (key === ".") changeInventoryPage(inventory, 1);
        if (key === ",") changeInventoryPage(inventory, -1);
    }
}

function canMoveInCurrentRoom(x, y) {
    // Check room tiles first
    if (canMove(rooms[currentRoomIndex], x, y)) {
        // Then check for collidable NPCs
        return !isNPCCollision(x, y, currentRoomIndex);
    }

    const exits = roomExits[currentRoomIndex];
    return exits.some(e => e.x === x && e.y === y);
}

function update() {
    // Dialogue updates
    if (dialogueSystem.state !== DIALOGUE_STATE.INACTIVE) {
        updateDialogue(dialogueSystem);
        return; // Pause other updates during dialogue
    }

    // Movement logic
    if (gameState.mode === 'overworld' && gameState.canMove && !player.moving) {
        let dx = 0, dy = 0;
        if (keys["ArrowUp"]) dy = -1;
        else if (keys["ArrowDown"]) dy = 1;
        else if (keys["ArrowLeft"]) dx = -1;
        else if (keys["ArrowRight"]) dx = 1;

        let nx = player.x + dx;
        let ny = player.y + dy;

        if ((dx !== 0 || dy !== 0) && canMoveInCurrentRoom(nx, ny)) {
            player.x = nx;
            player.y = ny;
            player.moving = true;
        }
    }

    // Player position update
    const movementCompleted = updatePlayerPosition(player);
    
    if (movementCompleted) {
        const exits = roomExits[currentRoomIndex];
        const exit = exits.find(e => e.x === player.x && e.y === player.y);
        if (exit) {
            player.x = exit.toX;
            player.y = exit.toY;
            player.px = player.x * TILE_SIZE;
            player.py = player.y * TILE_SIZE;
            
            roomTransition.active = true;
            roomTransition.direction = exit.direction;
            roomTransition.progress = 0;
            roomTransition.fromRoom = currentRoomIndex;
            roomTransition.toRoom = exit.toRoom;
            roomTransition.playerStartX = exit.toX;
            roomTransition.playerStartY = exit.toY;
            roomTransition.roomGap = exit.roomgap || 0;
            player.moving = false;
            gameState.canMove = false;
        }
    }

    // Inventory slide
    if (inventory.transitioning) {
        updateInventoryPosition(inventory, gameState);
    }

    // Room Transitions
    if (roomTransition.active) {
        roomTransition.progress += roomTransition.speed;

        const isHorizontal = roomTransition.direction === "left" || roomTransition.direction === "right";
        const transitionLimit = (isHorizontal ? canvas.width : canvas.height) + roomTransition.roomGap;

        if (roomTransition.progress >= transitionLimit) {
            currentRoomIndex = roomTransition.toRoom;
            player.x = roomTransition.playerStartX;
            player.y = roomTransition.playerStartY;
            player.px = player.x * TILE_SIZE;
            player.py = player.y * TILE_SIZE;
            player.moving = false;

            roomTransition.active = false;
            gameState.canMove = true;
        }
    }

    // Animation timers
    frameCounter++;
    if (frameCounter >= 14) {
        enemyFrame = (enemyFrame + 1) % 2;
        frameCounter = 0;
    }

    enemyAnimTimer += 14;
    if (enemyAnimTimer >= enemyAnimInterval) {
        enemyAnimTimer = 0;
        enemyAnimFrame = (enemyAnimFrame + 1) % 2;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roomTransition.active) {
        const offset = roomTransition.progress;
        const gap = roomTransition.roomGap;

        const dir = roomTransition.direction;
        const fromRoom = rooms[roomTransition.fromRoom];
        const toRoom = rooms[roomTransition.toRoom];

        let dx = 0, dy = 0;
        if (dir === "left") dx = 1;
        else if (dir === "right") dx = -1;
        else if (dir === "up") dy = 1;
        else if (dir === "down") dy = -1;

        const fromX = dx * offset;
        const fromY = dy * offset;
        const toX = dx * (offset - canvas.width - gap);
        const toY = dy * (offset - canvas.height - gap);

        drawRoom(ctx, fromRoom, fromX, fromY, assets.tileset);
        drawRoom(ctx, toRoom, toX, toY, assets.tileset);
        drawNPCsInTransition(ctx, roomTransition.fromRoom, fromX, fromY, assets.npcSpritesheet);
        drawNPCsInTransition(ctx, roomTransition.toRoom, toX, toY, assets.npcSpritesheet);

        const playerX = roomTransition.playerStartX * TILE_SIZE + toX;
        const playerY = roomTransition.playerStartY * TILE_SIZE + toY;
        drawPlayer(ctx, { px: playerX, py: playerY }, assets.playerImg);
    } else {
        drawRoom(ctx, rooms[currentRoomIndex], 0, 0, assets.tileset);
        drawNPCs(ctx, currentRoomIndex, assets.npcSpritesheet, player, keys);
        drawPlayer(ctx, player, assets.playerImg);
    }

    // Dialogue (drawn above world but below inventory)
    if (dialogueSystem.state !== DIALOGUE_STATE.INACTIVE) {
        drawDialogue(ctx, dialogueSystem, assets.textboxImg);
    }

    // Inventory (drawn on top of everything)
    if (inventory.visible || inventory.transitioning) {
        ctx.drawImage(assets.inventoryImg, 0, inventory.y);

        if (inventory.page === 0) {
            ctx.save();
            ctx.translate(0, inventory.y);
            drawInventoryPage1(ctx, playerStats, assets.playerImage);
            ctx.restore();
        } else if (inventory.page === 2) {
            ctx.save();
            ctx.translate(0, inventory.y);
            drawInventoryPage3(
                ctx, 
                seenEnemies, 
                enemyStatuses, 
                enemyFrame, 
                assets.enemyIcons, 
                assets.enemyStatusesImg, 
                assets.creatureGrid
            );
            ctx.restore();
        }
    }
}

let enemyFrame = 0;
let frameCounter = 0;

// Initialize game
loadAssets(() => {
    requestAnimationFrame(gameLoop);
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
