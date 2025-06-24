// eventSystem.js

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

    // Process all sub-events
    currentEvent.subEvents.forEach((subEvent, index) => {
        if (subEvent.isComplete) return;

        // Start new sub-events
        if (!subEvent.isStarted) {
            subEvent.isStarted = true;
            processSubEvent(subEvent, gameState);
        }

        // Check completion based on mode
        const isActiveParallel = (subEvent.executionMode === EXECUTION_MODES.PARALLEL);
        const isCurrentSequential = (index === eventSystem.currentSubEventIndex);
        
        if (isActiveParallel || isCurrentSequential) {
            subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
        }

        if (!subEvent.isComplete) allComplete = false;
    });

    // Manage sequential progression
    if (!allComplete) {
        const currentSubEvent = currentEvent.subEvents[eventSystem.currentSubEventIndex];
        if (currentSubEvent?.executionMode === EXECUTION_MODES.SEQUENTIAL && 
            !currentSubEvent.isComplete) {
            return;
        }
        eventSystem.currentSubEventIndex++;
    }

    // Finalize event
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
            gameState.dialogueSystem.currentLines = subEvent.lines;
            startDialogue(gameState.dialogueSystem);
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
            // Safely check dialogue completion
            return gameState.dialogueSystem?.state === DIALOGUE_STATE.INACTIVE;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            // Safely check movement completion
            return !gameState.player?.moving;
        default:
            return true;
    }
}
