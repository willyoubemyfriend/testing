import { startDialogue, updateDialogue, advanceDialogue, DIALOGUE_STATE } from './dialogueSystem.js';
import { updatePlayerPosition } from './playerSystem.js';
import { updateNPCPosition, setNPCTargetPosition, getNPCsInRoom } from './npcs.js';
import { currentRoomIndex } from './game.js';

export let currentEvent = null;

export function startEvent(event, roomIndex) {
    currentEvent = createEventInstance(event, roomIndex);
}

export function updateEvent(player, dialogueSystem, currentRoomIndex) {
    if (!currentEvent) return;

    currentEvent.update(player, dialogueSystem, currentRoomIndex);

    if (currentEvent.done) {
        currentEvent = null;
    }
}

export function isEventRunning() {
    return currentEvent !== null;
}

// ───────────────────── Event Instance ─────────────────────

function createEventInstance(eventDef, initialRoomIndex) {
    return {
        steps: eventDef.steps,
        stepIndex: 0,
        subevents: [],
        done: false,
        currentRoomIndex: initialRoomIndex,

        update(player, dialogueSystem, currentRoomIndex) {
            if (this.done) return;

            if (currentRoomIndex !== undefined) {
                this.currentRoomIndex = currentRoomIndex;
            }

            const step = this.steps[this.stepIndex];

            if (!this.subevents.length) {
                this.subevents = step.map(sub => 
                    createSubeventInstance(sub, player, dialogueSystem, this.currentRoomIndex)
                );
            }

            let allDone = true;
            for (const sub of this.subevents) {
                if (!sub.done) {
                    sub.update(player, dialogueSystem, this.currentRoomIndex);
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

function createSubeventInstance(sub, player, dialogueSystem, currentRoomIndex) {
    switch (sub.type) {
        case "dialogue":
            return createDialogueSub(sub, dialogueSystem);
        case "movePlayer":
            return createMovePlayerSub(sub, player);
        case "movePlayerRelative":
            return createMovePlayerRelativeSub(sub, player);
        case "moveNPC":
            return createMoveNPCSub(sub, currentRoomIndex);
        case "wait":
            return createWaitSub(sub);
        case "group":
            return createGroupSub(sub, player, dialogueSystem, currentRoomIndex);
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
    const targetX = player.x + (sub.dx || 0);
    const targetY = player.y + (sub.dy || 0);
    
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

// ─── Move NPC Subevent ───

function createMoveNPCSub(sub, currentRoomIndex) {
    const npcs = getNPCsInRoom(currentRoomIndex);
    const npc = npcs.find(n => n.id === sub.id);
    
    if (!npc) {
        return { done: true, update: () => {} };
    }

    // Calculate target position
    const targetX = sub.x !== undefined ? sub.x : npc.x + (sub.dx || 0);
    const targetY = sub.y !== undefined ? sub.y : npc.y + (sub.dy || 0);

    // Set target position and mark NPC as moving
    setNPCTargetPosition(npc, targetX, targetY);
    npc.moving = true;  // This is the crucial line that was missing
    
    return {
        done: false,
        update() {
            const finished = updateNPCPosition(npc);
            if (finished) {
                npc.moving = false;  // Clean up when movement is done
                this.done = true;
            }
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

function createGroupSub(sub, player, dialogueSystem, currentRoomIndex) {
    const groupEvent = createEventInstance({ steps: sub.steps }, currentRoomIndex);

    return {
        done: false,
        update() {
            groupEvent.update(player, dialogueSystem, currentRoomIndex);
            if (groupEvent.done) {
                this.done = true;
            }
        }
    };
}
