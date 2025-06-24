// Event Types (will expand later)
export const SUBEVENT_TYPES = {
    DIALOGUE: "DIALOGUE",
    MOVE_PLAYER: "MOVE_PLAYER",
    CHANGE_ROOM: "CHANGE_ROOM"
};

// Event System State
export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false
    };
}

// Process Sub-Events
export function updateEventSystem(eventSystem, gameState, deltaTime) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const currentSubEvent = eventSystem.activeEvent.subEvents[eventSystem.currentSubEventIndex];
    processSubEvent(currentSubEvent, gameState); // Handle the sub-event

    // Move to next sub-event when current completes
    if (currentSubEvent.isComplete) {
        eventSystem.currentSubEventIndex++;
        if (eventSystem.currentSubEventIndex >= eventSystem.activeEvent.subEvents.length) {
            eventSystem.isProcessing = false; // Event finished
        }
    }
}

// Sub-Event Processor (placeholder)
function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            if (!subEvent.isStarted) {
                startDialogue(gameState.dialogueSystem, subEvent.lines);
                subEvent.isStarted = true;
            }
            subEvent.isComplete = (gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE);
            break;
        case SUBEVENT_TYPES.MOVE_PLAYER:
            // Will implement later
            break;
        default:
            console.warn("Unknown sub-event type:", subEvent.type);
    }
}
