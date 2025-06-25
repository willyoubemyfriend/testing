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
export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const currentEvent = eventSystem.activeEvent;
    let allComplete = true;

    // Process all sub-events that should be active
    currentEvent.subEvents.forEach((subEvent, index) => {
        // Skip completed sub-events
        if (subEvent.isComplete) return;

        // Determine if this sub-event should be active
        const isSequential = subEvent.executionMode === EXECUTION_MODES.SEQUENTIAL;
        const isParallel = subEvent.executionMode === EXECUTION_MODES.PARALLEL;
        const isCurrentSequential = (index === eventSystem.currentSubEventIndex);
        
        if ((isParallel || isCurrentSequential) && !subEvent.isStarted) {
            subEvent.isStarted = true;
            processSubEvent(subEvent, gameState);
        }

        // Update completion status for active sub-events
        if (isParallel || isCurrentSequential) {
            subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
        }

        // Track overall completion
        if (!subEvent.isComplete) allComplete = false;
    });

    // Progress sequential index if needed
    if (!allComplete) {
        const currentSubEvent = currentEvent.subEvents[eventSystem.currentSubEventIndex];
        if (currentSubEvent?.isComplete) {
            eventSystem.currentSubEventIndex++;
        }
    }

    // Clean up when done
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
