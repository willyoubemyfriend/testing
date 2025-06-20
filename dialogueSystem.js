// dialogueSystem.js
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
        timer: 0,
        preprocessedLines: [] // New: Stores wrapped lines
    };
}

// New: Pre-calculates line breaks before typing begins
function preprocessText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

export function startDialogue(dialogueSystem, lines) {
    dialogueSystem.state = DIALOGUE_STATE.TYPING;
    dialogueSystem.currentLines = lines;
    dialogueSystem.currentLineIndex = 0;
    dialogueSystem.currentCharIndex = 0;
    dialogueSystem.timer = 0;
    dialogueSystem.preprocessedLines = []; // Reset when starting new dialogue
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

    // Save original context state (CRITICAL for isolation)
    const originalTextAlign = ctx.textAlign;
    const originalTextBaseline = ctx.textBaseline;
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;

    // Set dialogue-specific styles
    ctx.fillStyle = "white";
    ctx.font = '16px "friendfont"';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Draw textbox
    const textboxX = (ctx.canvas.width - 160) / 2;
    const textboxY = ctx.canvas.height - 144;
    ctx.drawImage(textboxImg, textboxX, textboxY);

    // Preprocess lines if not already done
    const currentLineText = dialogueSystem.currentLines[dialogueSystem.currentLineIndex];
    if (dialogueSystem.preprocessedLines.length <= dialogueSystem.currentLineIndex) {
        const maxWidth = 128;
        dialogueSystem.preprocessedLines[dialogueSystem.currentLineIndex] = 
            preprocessText(ctx, currentLineText, maxWidth);
    }

    // Render with typewriter effect
    const lines = dialogueSystem.preprocessedLines[dialogueSystem.currentLineIndex];
    const maxChars = dialogueSystem.currentCharIndex;
    const lineHeight = 16;
    let charsRemaining = maxChars;
    let yPos = textboxY + 16;

    for (const line of lines) {
        if (charsRemaining <= 0) break;
        
        const visibleChars = Math.min(charsRemaining, line.length);
        ctx.fillText(line.substring(0, visibleChars), textboxX + 16, yPos);
        
        charsRemaining -= line.length + 1; // +1 for space
        yPos += lineHeight;
    }

    // Restore original context (MUST happen every time)
    ctx.textAlign = originalTextAlign;
    ctx.textBaseline = originalTextBaseline;
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;
}
