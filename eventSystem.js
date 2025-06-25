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

    const currentEvent = eventSystem.activeEvent;
    let allComplete = true;

    // Process all relevant sub-events
    currentEvent.subEvents.forEach((subEvent, index) => {
        // Only process if:
        // - Parallel mode, OR
        // - Sequential and it's the current index
        const shouldProcess = subEvent.executionMode === EXECUTION_MODES.PARALLEL || 
                            index === eventSystem.currentSubEventIndex;

        if (!shouldProcess) return;

        // Start if not started
        if (!subEvent.isStarted) {
            subEvent.isStarted = true;
            processSubEvent(subEvent, gameState);
        }

        // Check completion
        subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
        
        // Track overall completion
        if (!subEvent.isComplete) allComplete = false;
    });

    // Only advance sequential index if current sequential event is complete
    const currentSubEvent = currentEvent.subEvents[eventSystem.currentSubEventIndex];
    if (currentSubEvent?.executionMode === EXECUTION_MODES.SEQUENTIAL && 
        currentSubEvent.isComplete) {
        eventSystem.currentSubEventIndex++;
    }

    // End event if all complete
    if (allComplete) {
        eventSystem.isProcessing = false;
    }
}

// Sub-Event Processing
function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            if (!gameState.dialogueSystem) {
                console.error("Missing dialogue system");
                subEvent.isComplete = true;
                return;
            }
            startDialogue(gameState.dialogueSystem, subEvent.lines);
            break;

        case SUBEVENT_TYPES.MOVE_PLAYER:
            gameState.player.moving = true;
            gameState.player.x = subEvent.targetX;
            gameState.player.y = subEvent.targetY;
            break;

        default:
            console.warn("Unhandled sub-event type:", subEvent.type);
            subEvent.isComplete = true;
    }
}

// Completion Checking
function checkSubEventCompletion(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            return gameState.dialogueSystem?.state === DIALOGUE_STATE.INACTIVE;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player?.moving;
        default:
            return true;
    }
}
