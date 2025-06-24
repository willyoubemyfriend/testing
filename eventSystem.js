// eventSystem.js

// Sub-event types must be exported if used elsewhere
export const SUBEVENT_TYPES = {
    DIALOGUE: "DIALOGUE",
    MOVE_PLAYER: "MOVE_PLAYER",
    CHANGE_ROOM: "CHANGE_ROOM"
};

export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const currentSubEvent = eventSystem.activeEvent.subEvents[eventSystem.currentSubEventIndex];
    if (!currentSubEvent.isStarted) {
        currentSubEvent.isStarted = true;
        currentSubEvent.isComplete = false;
        processSubEvent(currentSubEvent, gameState);
    }

    if (currentSubEvent.isComplete) {
        eventSystem.currentSubEventIndex++;
        if (eventSystem.currentSubEventIndex >= eventSystem.activeEvent.subEvents.length) {
            eventSystem.isProcessing = false;
        }
    }
}

// Helper function (not exported)
function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case SUBEVENT_TYPES.DIALOGUE:
            if (!gameState.dialogueSystem) {
                console.error("Dialogue system not found in gameState");
                subEvent.isComplete = true;
                return;
            }
            gameState.dialogueSystem.currentLines = subEvent.lines;
            startDialogue(gameState.dialogueSystem);
            subEvent.isComplete = (gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE);
            break;
        default:
            console.warn("Unhandled sub-event type:", subEvent.type);
            subEvent.isComplete = true;
    }
}
