export function createEventSystem() {
    return {
        activeEvent: null,
        currentSubEventIndex: 0,
        isProcessing: false,
        deltaTime: 0
    };
}

export function updateEventSystem(eventSystem, gameState) {
    if (!eventSystem.isProcessing || !eventSystem.activeEvent) return;

    const currentSubEvent = eventSystem.activeEvent.subEvents[eventSystem.currentSubEventIndex];
    if (!currentSubEvent.isStarted) {
        currentSubEvent.isStarted = true;
        currentSubEvent.isComplete = false;
    }

    processSubEvent(currentSubEvent, gameState);

    if (currentSubEvent.isComplete) {
        eventSystem.currentSubEventIndex++;
        if (eventSystem.currentSubEventIndex >= eventSystem.activeEvent.subEvents.length) {
            eventSystem.isProcessing = false;
        }
    }
}

export function processSubEvent(subEvent, gameState) {
    switch (subEvent.type) {
        case "DIALOGUE":
            if (!subEvent.isStarted) {
                gameState.dialogueSystem.currentLines = subEvent.lines;
                startDialogue(gameState.dialogueSystem);
                subEvent.isStarted = true;
            }
            subEvent.isComplete = (gameState.dialogueSystem.state === DIALOGUE_STATE.INACTIVE);
            break;
        default:
            console.warn("Unhandled sub-event type:", subEvent.type);
            subEvent.isComplete = true; // Skip unimplemented events
    }
}
