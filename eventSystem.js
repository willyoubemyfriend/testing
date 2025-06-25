import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventTypes.js';
import { startDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { EVENT_DIALOGUE } from './gameScripts.js';
import { TILE_SIZE } from './roomSystem.js';

export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false,
        parallelCompletion: {},
        waitingForDialogue: false
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    // Handle waiting for dialogue completion
    if (eventSystem.waitingForDialogue) {
        if (gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE) {
            eventSystem.waitingForDialogue = false;
            eventSystem.currentSubEventIndex++;
        } else {
            return; // Don't process anything else while waiting
        }
    }

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // Process all parallel events
    event.subEvents.forEach((subEvent) => {
        if (subEvent.executionMode === EXECUTION_MODES.PARALLEL) {
            if (!subEvent.isStarted) {
                subEvent.isStarted = true;
                processSubEvent(subEvent, gameState, eventSystem);
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
            processSubEvent(currentSubEvent, gameState, eventSystem);
        }

        if (currentSubEvent.type === SUBEVENT_TYPES.NPC_DIALOGUE) {
            // Dialogue completion is handled separately
            if (gameState.dialogueSystem.state !== DIALOGUE_STATE.INACTIVE) {
                eventSystem.waitingForDialogue = true;
                allComplete = false;
            } else {
                currentSubEvent.isComplete = true;
                eventSystem.currentSubEventIndex++;
            }
        } else {
            currentSubEvent.isComplete = checkSubEventCompletion(currentSubEvent, gameState);
            if (currentSubEvent.isComplete) {
                eventSystem.currentSubEventIndex++;
            } else {
                allComplete = false;
            }
        }
    }

    // Complete event if all done
    if (eventSystem.currentSubEventIndex >= event.subEvents.length && allComplete) {
        eventSystem.isProcessing = false;
        eventSystem.activeEvent = null;
        eventSystem.currentSubEventIndex = 0;
        eventSystem.waitingForDialogue = false;
    }
}

function processSubEvent(subEvent, gameState, eventSystem) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            const dialogueLines = EVENT_DIALOGUE[subEvent.npcId] || ["..."];
            startDialogue(gameState.dialogueSystem, dialogueLines);
            gameState.canMove = subEvent.executionMode === EXECUTION_MODES.PARALLEL;
            break;

        case SUBEVENT_TYPES.MOVE_PLAYER:
            gameState.player.moving = true;
            gameState.player.x = subEvent.targetX;
            gameState.player.y = subEvent.targetY;
            gameState.player.px = gameState.player.x * TILE_SIZE;
            gameState.player.py = gameState.player.y * TILE_SIZE;
            gameState.canMove = subEvent.executionMode === EXECUTION_MODES.PARALLEL;
            break;
    }
}

function checkSubEventCompletion(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            // Dialogue completion handled separately
            return false;

        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player.moving;

        default:
            return true;
    }
}
