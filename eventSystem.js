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
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const event = eventSystem.activeEvent;
    let allComplete = true;

    // --- Process parallel sub-events ---
    event.subEvents.forEach((subEvent) => {
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

    // --- Process current sequential sub-event ---
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
            eventSystem.currentSubEventIndex++;
        }
    }

    // --- Check if all sub-events are done ---
    if (eventSystem.currentSubEventIndex >= event.subEvents.length && allComplete) {
        completeEvent(eventSystem, gameState);
    }
}

function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.NPC_DIALOGUE: {
            const dialogueLines = EVENT_DIALOGUE[subEvent.npcId] || ["..."];
            startDialogue(gameState.dialogueSystem, dialogueLines);
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
            return gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE;

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
}
