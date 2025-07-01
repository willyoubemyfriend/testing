import { startDialogue, updateDialogue, advanceDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { updatePlayerPosition } from './playerSystem.js';

export let currentEvent = null;

export function startEvent(event) {
    currentEvent = createEventInstance(event);
}

export function updateEvent(player, dialogueSystem) {
    if (!currentEvent) return;

    currentEvent.update();

    if (currentEvent.done) {
        currentEvent = null;
    }
}

export function isEventRunning() {
    return currentEvent !== null;
}

function createEventInstance(event) {
    return {
        steps: event.steps,
        stepIndex: 0,
        subevents: [],
        done: false,

        update() {
            if (this.done) return;

            const step = this.steps[this.stepIndex];

            if (!this.subevents.length) {
                // Initialize subevents in this step
                step.forEach(sub => {
                    const instance = createSubeventInstance(sub);
                    this.subevents.push(instance);
                });
            }

            let allDone = true;
            for (const sub of this.subevents) {
                if (!sub.done) {
                    sub.update();
                    if (!sub.done) allDone = false;
                }
            }

            if (allDone) {
                this.subevents = [];
                this.stepIndex++;
                if (this.stepIndex >= this.steps.length) {
                    this.done = true;
                }
            }
        }
    };
}

function createSubeventInstance(sub) {
    switch (sub.type) {
        case "dialogue":
            return createDialogueSub(sub);
        case "movePlayer":
            return createMovePlayerSub(sub);
        case "wait":
            return createWaitSub(sub);
        case "group":
            return createGroupSub(sub);
        default:
            throw new Error(`Unknown subevent type: ${sub.type}`);
    }
}

// ─────────── Dialogue ───────────
function createDialogueSub(sub) {
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

// ─────────── Move Player ───────────
function createMovePlayerSub(sub) {
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

// ─────────── Wait ───────────
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

// ─────────── Group ───────────
// A mini-event with its own steps and subevents
function createGroupSub(sub) {
    const group = createEventInstance({ steps: sub.steps });
    return {
        done: false,
        update() {
            group.update();
            if (group.done) this.done = true;
        }
    };
}
