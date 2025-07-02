import { startDialogue, updateDialogue, advanceDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { updatePlayerPosition } from './playerSystem.js';

export let currentEvent = null;

export function startEvent(event) {
    currentEvent = createEventInstance(event);
}

export function updateEvent(player, dialogueSystem) {
    if (!currentEvent) return;

    currentEvent.update(player, dialogueSystem);

    if (currentEvent.done) {
        currentEvent = null;
    }
}

export function isEventRunning() {
    return currentEvent !== null;
}

// ───────────────────── Event Instance ─────────────────────

function createEventInstance(eventDef) {
    return {
        steps: eventDef.steps,
        stepIndex: 0,
        subevents: [],
        done: false,

        update(player, dialogueSystem) {
            if (this.done) return;

            const step = this.steps[this.stepIndex];

            if (!this.subevents.length) {
                this.subevents = step.map(sub => createSubeventInstance(sub, player, dialogueSystem));
            }

            let allDone = true;
            for (const sub of this.subevents) {
                if (!sub.done) {
                    sub.update(player, dialogueSystem);
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

// ───────────────────── Subevent Instances ─────────────────────

function createSubeventInstance(sub, player, dialogueSystem) {
    switch (sub.type) {
        case "dialogue":
            return createDialogueSub(sub, dialogueSystem);
        case "movePlayer":
            return createMovePlayerSub(sub, player);
        case "movePlayerRelative":
            return createMovePlayerRelativeSub(sub, player);
        case "wait":
            return createWaitSub(sub);
        case "group":
            return createGroupSub(sub, player, dialogueSystem);
        default:
            throw new Error(`Unknown subevent type: ${sub.type}`);
    }
}

// ─── Dialogue Subevent ───

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

// ─── Move Player Subevent ───

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

// ─── Move Player Relative Subevent ───
function createMovePlayerRelativeSub(sub, player) {
    // Calculate target position relative to current position
    const targetX = player.x + (sub.dx || 0);
    const targetY = player.y + (sub.dy || 0);
    
    // Set player's target position and start moving
    player.x = targetX;
    player.y = targetY;
    player.moving = true;
    
    return {
        done: false,
        update() {
            const finished = updatePlayerPosition(player);
            if (finished) this.done = true;
        }
    };
}

// ─── Wait Subevent ───

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

// ─── Group Subevent (Nested Event) ───

function createGroupSub(sub, player, dialogueSystem) {
    const groupEvent = createEventInstance({ steps: sub.steps });

    return {
        done: false,
        update() {
            groupEvent.update(player, dialogueSystem);
            if (groupEvent.done) {
                this.done = true;
            }
        }
    };
}
