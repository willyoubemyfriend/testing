import { startDialogue, updateDialogue, advanceDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { updatePlayerPosition } from './playerSystem.js';

export let currentEvent = null;

export function startEvent(event) {
    currentEvent = {
        steps: event.steps,
        stepIndex: 0,
        subevents: [],
        waiting: false
    };
}

export function updateEvent(player, dialogueSystem) {
    if (!currentEvent) return;

    const step = currentEvent.steps[currentEvent.stepIndex];

    if (!currentEvent.subevents.length) {
        // Initialize subevents in this step
        step.forEach(sub => {
            const instance = createSubeventInstance(sub, player, dialogueSystem);
            currentEvent.subevents.push(instance);
        });
    }

    let allDone = true;
    for (const sub of currentEvent.subevents) {
        if (!sub.done) {
            sub.update();
            if (!sub.done) allDone = false;
        }
    }

    if (allDone) {
        currentEvent.subevents = [];
        currentEvent.stepIndex++;
        if (currentEvent.stepIndex >= currentEvent.steps.length) {
            currentEvent = null;
        }
    }
}

export function isEventRunning() {
    return currentEvent !== null;
}

function createSubeventInstance(sub, player, dialogueSystem) {
    switch (sub.type) {
        case "dialogue":
            return createDialogueSub(sub, dialogueSystem);
        case "movePlayer":
            return createMovePlayerSub(sub, player);
        case "wait":
            return createWaitSub(sub);
        default:
            throw new Error(`Unknown subevent type: ${sub.type}`);
    }
}

// ───────────────────── Dialogue Subevent ─────────────────────

function createDialogueSub(sub, dialogueSystem) {
    startDialogue(dialogueSystem, sub.lines);
    return {
        done: false,
        update() {
            updateDialogue(dialogueSystem);
            if (dialogueSystem.state === DIALOGUE_STATE.INACTIVE) {
                this.done = true;
            }
        }
    };
}

// ───────────────────── Move Player Subevent ─────────────────────

function createMovePlayerSub(sub, player) {
    player.x = sub.x;
    player.y = sub.y;
    player.moving = true;
    return {
        done: false,
        update() {
            const finished = updatePlayerPosition(player);
            if (finished) this.done = true;
        }
    };
}

// ───────────────────── Wait Timer Subevent ─────────────────────

function createWaitSub(sub) {
    let timer = sub.duration;
    return {
        done: false,
        update() {
            timer--;
            if (timer <= 0) this.done = true;
        }
    };
}
