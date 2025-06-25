import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventSystem.js';

export const GAME_EVENTS = {
    // Basic test event
    TEST_EVENT: {
        description: "Test dialogue event",
        subEvents: [
            {
                type: SUBEVENT_TYPES.DIALOGUE,
                lines: ["This is a test event!", "It works!"],
                executionMode: EXECUTION_MODES.SEQUENTIAL,
                isStarted: false,
                isComplete: false
            },
            {
                type: SUBEVENT_TYPES.DIALOGUE,
                lines: ["This is testing two dialogues in sequence."],
                executionMode:EXECUTION_MODES.SEQUENTIAL,
                isStarted: false,
                isComplete: false
            }
        ]
    },

    // Parallel example
    PARALLEL_DEMO: {
        description: "NPC talks while moving",
        subEvents: [
            {
                type: SUBEVENT_TYPES.DIALOGUE,
                lines: ["Watch me move and talk at the same time!"],
                executionMode: EXECUTION_MODES.PARALLEL
            },
            {
                type: SUBEVENT_TYPES.MOVE_PLAYER,
                targetX: 5,
                targetY: 3,
                speed: 1,
                executionMode: EXECUTION_MODES.PARALLEL
            },
            {
                type: SUBEVENT_TYPES.DIALOGUE,
                lines: ["Now I'll talk AFTER moving"],
                executionMode: EXECUTION_MODES.SEQUENTIAL
            }
        ]
    }
};
