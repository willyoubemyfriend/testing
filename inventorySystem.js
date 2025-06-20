export function createInventory() {
    return {
        visible: false,
        y: 144, // start offscreen
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

export function drawInventoryPage1(ctx, playerStats, playerImage) {
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;
    // Draw the player portrait
    ctx.drawImage(playerImage, 0, 0);

    // Text settings
    ctx.fillStyle = "white";
    ctx.font = '8px "Press Start 2P"';

    // HP & Location under portrait
    ctx.fillText(`HP: `, 16, 119);
    ctx.fillText(`${playerStats.name}`, 16, 108);
    ctx.font = '16px "friendfont"';
    ctx.fillText(`${playerStats.hp}/${playerStats.maxhp}`, 48, 118);
    ctx.fillText(`${playerStats.location}`, 16, 128);

    // Description to the right
    wrapText(ctx, playerStats.description, 88, 24, 60, 10);

    // Stats under description
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`ATT: ${playerStats.attack}`, 88, 73);
    ctx.fillText(`DEF: ${playerStats.defense}`, 88, 85);
    ctx.fillText(`DRD: ${playerStats.dread}`, 88, 97);
   
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;

}

export function drawInventoryPage3(ctx, seenEnemies, enemyStatuses, enemyFrame, enemyIcons, enemyStatusesImg, creatureGrid) {
    ctx.drawImage(creatureGrid, 0, 0);

    for (let i = 0; i < 28; i++) {
        const row = i % 7;
        const col = Math.floor(i / 7);

        const x = 16 + col * 32;
        const y = 16 + row * 16;

        // Draw enemy icon
        let spriteIndex = seenEnemies[i] ? i : 28; // 0–27 = enemy, 28 = ?
        ctx.drawImage(
            enemyIcons,
            spriteIndex * 16,
            enemyFrame * 16,
            16, 16,
            x, y,
            16, 16
        );

        // Determine status icon index
        let status = enemyStatuses[i];
        let statusIndex = 0;
        if (status === "closure") statusIndex = 1;
        else if (status === "newlife") statusIndex = 2;

        // Draw status icon to the right of the enemy icon
        ctx.drawImage(
            enemyStatusesImg,
            statusIndex * 16, 0,
            16, 16,
            x + 15, y,
            16, 16
        );
    }
}

export function calculateLineBreaks(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '16px "friendfont"'; 
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight, currentCharCount) {
    const lines = calculateLineBreaks(text, maxWidth);
    let charsRemaining = currentCharCount;
    let currentY = y;
    
    for (const line of lines) {
        if (charsRemaining <= 0) break;
        
        const displayChars = Math.min(charsRemaining, line.length);
        ctx.fillText(line.substring(0, displayChars), x, currentY);
        
        currentY += lineHeight;
        charsRemaining -= line.length + 1; // +1 for the space
    }
}

