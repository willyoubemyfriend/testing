// dialogueSystem.js
import { wrapText } from './inventorySystem.js';

export const textboxImg = new Image();
textboxImg.src = 'assets/textbox.png';

export const DIALOGUE_STATE = {
    INACTIVE: 0,
    ACTIVE: 1,
    TYPING: 2
};

export function createDialogueSystem() {
    return {
        state: DIALOGUE_STATE.INACTIVE,
        currentLines: [],
        currentLineIndex: 0,
        currentCharIndex: 0,
        typingSpeed: 2,
        timer: 0
    };
}

export function startDialogue(dialogueSystem, lines) {
    dialogueSystem.state = DIALOGUE_STATE.TYPING;
    dialogueSystem.currentLines = lines;
    dialogueSystem.currentLineIndex = 0;
    dialogueSystem.currentCharIndex = 0;
}

export function updateDialogue(dialogueSystem) {
    if (dialogueSystem.state !== DIALOGUE_STATE.TYPING) return;

    dialogueSystem.timer++;
    if (dialogueSystem.timer >= dialogueSystem.typingSpeed) {
        dialogueSystem.timer = 0;
        dialogueSystem.currentCharIndex++;
        
        if (dialogueSystem.currentCharIndex >= 
            dialogueSystem.currentLines[dialogueSystem.currentLineIndex].length) {
            dialogueSystem.state = DIALOGUE_STATE.ACTIVE;
        }
    }
}

export function advanceDialogue(dialogueSystem) {
    if (dialogueSystem.state === DIALOGUE_STATE.TYPING) {
        // Fast-forward to end of current line
        dialogueSystem.currentCharIndex = 
            dialogueSystem.currentLines[dialogueSystem.currentLineIndex].length;
        dialogueSystem.state = DIALOGUE_STATE.ACTIVE;
        return;
    }

    dialogueSystem.currentLineIndex++;
    if (dialogueSystem.currentLineIndex >= dialogueSystem.currentLines.length) {
        dialogueSystem.state = DIALOGUE_STATE.INACTIVE;
    } else {
        dialogueSystem.state = DIALOGUE_STATE.TYPING;
        dialogueSystem.currentCharIndex = 0;
    }
}

export function drawDialogue(ctx, dialogueSystem, textboxImg) {
    if (dialogueSystem.state === DIALOGUE_STATE.INACTIVE) return;

    // Save original context state
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;

    // Draw textbox (centered horizontally, at bottom)
    const textboxX = (ctx.canvas.width - 160) / 2;
    const textboxY = ctx.canvas.height - 144;
    ctx.drawImage(textboxImg, textboxX, textboxY);

    // Set DIALOGUE-SPECIFIC text styles
    ctx.fillStyle = "white";
    ctx.font = '16px "friendfont"';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Dialogue text positioning (independent of other systems)
    const textX = 16;
    const textY = 96;
    const maxWidth = 128;
    const lineHeight = 10;

    const currentText = dialogueSystem.currentLines[dialogueSystem.currentLineIndex]
        .substring(0, dialogueSystem.currentCharIndex);
    
    wrapText(ctx, currentText, textX, textY, maxWidth, lineHeight);

    // Restore original context state
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
}
