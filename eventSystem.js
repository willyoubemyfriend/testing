// eventSystem.js
import {
    startDialogue,
    DIALOGUE_STATE
} from './dialogueSystem.js';

// Event Types and Execution Modes
export const SUBEVENT_TYPES = {
    DIALOGUE: "DIALOGUE",
    MOVE_PLAYER: "MOVE_PLAYER",
    CHANGE_ROOM: "CHANGE_ROOM"
};

export const EXECUTION_MODES = {
    SEQUENTIAL: "SEQUENTIAL",
    PARALLEL: "PARALLEL"
};

// Core System
export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false,
        parallelCompletion: {} // Tracks parallel sub-event completion
    };
}

// Main Update Loop
export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // Process current sequential OR all parallel events
    event.subEvents.forEach((subEvent, index) => {
        const isCurrent = index === eventSystem.currentSubEventIndex;
        const isParallel = subEvent.executionMode === EXECUTION_MODES.PARALLEL;
        
        if (isParallel || isCurrent) {
            // Start if not started
            if (!subEvent.isStarted) {
                subEvent.isStarted = true;
                processSubEvent(subEvent, gameState);
            }

            // Check completion
            subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
            
            if (!subEvent.isComplete) {
                allComplete = false;
            } else if (isCurrent) {
                // Only advance index for sequential events
                eventSystem.currentSubEventIndex++;
            }
        }
    });

    if (allComplete) {
        eventSystem.isProcessing = false;
    }
}

// Enhanced processSubEvent
function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            gameState.dialogueSystem.currentLines = subEvent.lines;
            startDialogue(gameState.dialogueSystem);
            break;
            
        case SUBEVENT_TYPES.MOVE_PLAYER:
            gameState.player.moving = true;
            gameState.player.x = subEvent.targetX;
            gameState.player.y = subEvent.targetY;
            break;
    }
}

// Enhanced completion check
function checkSubEventCompletion(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            return gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player.moving;
        default:
            return true;
    }
}
