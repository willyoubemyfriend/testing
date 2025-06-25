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
            return;
        }
    }

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // Process parallel events
    event.subEvents.forEach((subEvent, index) => {
        if (subEvent.executionMode === EXECUTION_MODES.PARALLEL) {
            if (!subEvent.isStarted) {
                subEvent.isStarted = true;
                processSubEvent(subEvent, gameState, eventSystem);
            }
            
            subEvent.isComplete = checkSubEventCompletion(subEvent, gameState);
            if (!subEvent.isComplete) allComplete = false;
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
            if (gameState.dialogueSystem.state !== DIALOGUE_STATE.INACTIVE) {
                eventSystem.waitingForDialogue = true;
                allComplete = false;
            } else {
                currentSubEvent.isComplete = true;
            }
        } else {
            currentSubEvent.isComplete = checkSubEventCompletion(currentSubEvent, gameState);
            if (currentSubEvent.isComplete) eventSystem.currentSubEventIndex++;
        }

        if (!currentSubEvent.isComplete) allComplete = false;
    }

    // Check completion
    if (eventSystem.currentSubEventIndex >= event.subEvents.length && allComplete) {
        completeEvent(eventSystem, gameState);
    }
}

function processSubEvent(subEvent, gameState, eventSystem) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE: {
            const lines = EVENT_DIALOGUE[subEvent.npcId] || ["..."];
            startDialogue(gameState.dialogueSystem, lines);
            gameState.canMove = subEvent.executionMode === EXECUTION_MODES.PARALLEL;
            break;
        }

        case SUBEVENT_TYPES.MOVE_PLAYER:
            gameState.player.moving = true;
            gameState.player.x = subEvent.targetX;
            gameState.player.y = subEvent.targetY;
            gameState.player.px = gameState.player.x * TILE_SIZE;
            gameState.player.py = gameState.player.y * TILE_SIZE;
            break;
    }
}


function checkSubEventCompletion(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE:
            return true; // Completion handled by waitingForDialogue check
        case SUBEVENT_TYPES.MOVE_PLAYER:
            return !gameState.player.moving;
        default:
            return true;
    }
}

function completeEvent(eventSystem, gameState) {
    eventSystem.isProcessing = false;
    eventSystem.activeEvent = null;
    eventSystem.currentSubEventIndex = 0;
    eventSystem.waitingForDialogue = false;
    gameState.canMove = true;
}
