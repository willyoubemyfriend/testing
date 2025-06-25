import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventTypes.js';
import { startDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { EVENT_DIALOGUE } from './gameScripts.js';

export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false,
        parallelCompletion: {}
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // Process all parallel events first
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

    // Then process current sequential event
    const currentSubEvent = event.subEvents[eventSystem.currentSubEventIndex];
    if (currentSubEvent && currentSubEvent.executionMode === EXECUTION_MODES.SEQUENTIAL) {
        if (!currentSubEvent.isStarted) {
            currentSubEvent.isStarted = true;
            processSubEvent(currentSubEvent, gameState);
        }
        
        currentSubEvent.isComplete = checkSubEventCompletion(currentSubEvent, gameState);
        if (!currentSubEvent.isComplete) {
            allComplete = false;
        } else {
            // Only move to next event if current sequential is complete
            eventSystem.currentSubEventIndex++;
        }
    }

    // Check if all events are complete
    if (eventSystem.currentSubEventIndex >= event.subEvents.length) {
        eventSystem.isProcessing = false;
        eventSystem.activeEvent = null;
        eventSystem.currentSubEventIndex = 0;
    }
}

function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            // Use the event dialogue instead of direct lines
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
        case SUBEVENT_TYPES.DIALOGUE:
            return gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player.moving;
        default:
            return true;
    }
}
