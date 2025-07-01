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

function createEventInstance(event) {
    return {
        steps: event.steps,
        stepIndex: 0,
        subevents: [],
        done: false,

        update(player, dialogueSystem) {
            if (this.done) return;

            const step = this.steps[this.stepIndex];

            if (!this.subevents.length) {
                step.forEach(sub => {
                    const instance = createSubeventInstance(sub, player, dialogueSystem);
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

function createSubeventInstance(sub, player, dialogueSystem) {
    switch (sub.type) {
        case "dialogue":
            return createDialogueSub(sub, dialogueSystem);
        case "movePlayer":
            return createMovePlayerSub(sub, player);
        case "wait":
            return createWaitSub(sub);
        case "group":
            return createGroupSub(sub, player, dialogueSystem);
    }
}

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

function createGroupSub(sub, player, dialogueSystem) {
    const group = createEventInstance({ steps: sub.steps });
    return {
        done: false,
        update() {
            group.update(player, dialogueSystem);
            if (group.done) this.done = true;
        }
    };
}
