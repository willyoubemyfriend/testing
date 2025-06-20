// inventorySystem.js
export function createInventory() {
    return {
        visible: false,
        y: 144,
        targetY: 144,
        page: 0,
        maxPages: 3,
        transitionSpeed: 6,
        transitioning: false
    };
}

export function toggleInventory(inventory, canvas, gameState) {
    if (inventory.transitioning) return;
    inventory.transitioning = true;

    if (!inventory.visible) {
        gameState.mode = 'inventory';
        inventory.targetY = (canvas.height - 144) / 2;
        inventory.visible = true;
        gameState.canMove = false;
    } else {
        inventory.targetY = 144;
        inventory.visible = false;
    }
}

export function changeInventoryPage(inventory, direction) {
    const newPage = inventory.page + direction;
    if (newPage >= 0 && newPage < inventory.maxPages) {
        inventory.page = newPage;
    }
}

export function updateInventoryPosition(inventory, gameState) {
    if (Math.abs(inventory.y - inventory.targetY) < inventory.transitionSpeed) {
        inventory.y = inventory.targetY;
        inventory.transitioning = false;

        if (!inventory.visible) {
            gameState.mode = 'overworld';
            gameState.canMove = true;
        }
    } else {
        inventory.y += (inventory.y < inventory.targetY ? 1 : -1) * inventory.transitionSpeed;
    }
}

// New optimized text wrapping function
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        const testLine = line ? `${line} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n];
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

export function drawInventoryPage1(ctx, playerStats, playerImage) {
    // Save original context state
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;

    // Draw player portrait
    ctx.drawImage(playerImage, 0, 0);

    // Set inventory-specific text styles
    ctx.fillStyle = "white";
    ctx.font = '8px "Press Start 2P"';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // HP & Location
    ctx.fillText(`HP:`, 16, 119);
    ctx.fillText(`${playerStats.name}`, 16, 108);
    ctx.font = '16px "friendfont"';
    ctx.fillText(`${playerStats.hp}/${playerStats.maxhp}`, 48, 118);
    ctx.fillText(`${playerStats.location}`, 16, 128);

    // Description
    ctx.font = '8px "Press Start 2P"';
    wrapText(ctx, playerStats.description, 88, 24, 60, 10);

    // Stats
    ctx.fillText(`ATT: ${playerStats.attack}`, 88, 73);
    ctx.fillText(`DEF: ${playerStats.defense}`, 88, 85);
    ctx.fillText(`DRD: ${playerStats.dread}`, 88, 97);

    // Restore original context
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
}

export function drawInventoryPage3(ctx, seenEnemies, enemyStatuses, enemyFrame, enemyIcons, enemyStatusesImg, creatureGrid) {
    // Save original context state
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;

    ctx.drawImage(creatureGrid, 0, 0);

    for (let i = 0; i < 28; i++) {
        const row = i % 7;
        const col = Math.floor(i / 7);
        const x = 16 + col * 32;
        const y = 16 + row * 16;

        // Draw enemy icon
        const spriteIndex = seenEnemies[i] ? i : 28;
        ctx.drawImage(
            enemyIcons,
            spriteIndex * 16, enemyFrame * 16,
            16, 16,
            x, y,
            16, 16
        );

        // Draw status icon
        const status = enemyStatuses[i];
        const statusIndex = status === "closure" ? 1 : status === "newlife" ? 2 : 0;
        ctx.drawImage(
            enemyStatusesImg,
            statusIndex * 16, 0,
            16, 16,
            x + 15, y,
            16, 16
        );
    }

    // Restore original context
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
}
