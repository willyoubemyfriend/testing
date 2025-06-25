import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventTypes.js';
import { startDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { EVENT_DIALOGUE } from './gameScripts.js';

export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false,
        parallelCompletion: {},
        isWaitingForDialogue: false // New flag to track dialogue state
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    // If we're waiting for dialogue to complete, check its state
    if (eventSystem.isWaitingForDialogue) {
        if (gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE) {
            eventSystem.isWaitingForDialogue = false;
            eventSystem.currentSubEventIndex++;
        } else {
            return; // Keep waiting until dialogue finishes
        }
    }

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // Process parallel events first (unchanged)
    event.subEvents.forEach((subEvent, index) => {
        if (subEvent.executionMode === EXECUTION_MODES.PARALLEL) {
            if (!subEvent.isStarted) {
                subEvent.isStarted = true;
                processSubEvent(subEvent, gameState);
            }
            
            subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
            if (!subEvent.isComplete) {
                allComplete = false;
            }
        }
    });

    // Process current sequential event
    const currentSubEvent = event.subEvents[eventSystem.currentSubEventIndex];
    if (currentSubEvent && currentSubEvent.executionMode === EXECUTION_MODES.SEQUENTIAL) {
        if (!currentSubEvent.isStarted) {
            currentSubEvent.isStarted = true;
            processSubEvent(currentSubEvent, gameState);
            
            // Special handling for dialogue
            if (currentSubEvent.type === SUBEVENT_TYPES.NPC_DIALOGUE) {
                eventSystem.isWaitingForDialogue = true;
                return; // Wait until next frame to check completion
            }
        }
        
        currentSubEvent.isComplete = checkSubEventCompletion(currentSubEvent, gameState);
        if (!currentSubEvent.isComplete) {
            allComplete = false;
        } else if (!eventSystem.isWaitingForDialogue) {
            eventSystem.currentSubEventIndex++;
        }
    }

    // Check completion
    if (eventSystem.currentSubEventIndex >= event.subEvents.length && allComplete) {
        eventSystem.isProcessing = false;
        eventSystem.activeEvent = null;
        eventSystem.currentSubEventIndex = 0;
        eventSystem.isWaitingForDialogue = false;
    }
}

function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            const dialogueLines = EVENT_DIALOGUE[subEvent.npcId] || ["..."];
            startDialogue(gameState.dialogueSystem, dialogueLines);
            break;
            
        case SUBEVENT_TYPES.MOVE_PLAYER:
            gameState.player.moving = true;
            gameState.player.x = subEvent.targetX;
            gameState.player.y = subEvent.targetY;
            break;
    }
}

function checkSubEventCompletion(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            // Dialogue completion is handled separately via isWaitingForDialogue
            return false;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player.moving;
        default:
            return true;
    }
}
