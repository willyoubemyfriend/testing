// gameScripts.js
import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventSystem.js';

export const GAME_EVENTS = {
    TEST_EVENT: {
        description: "Test dialogue event",
        subEvents: [
            {
                type: SUBEVENT_TYPES.NPC_DIALOGUE,
                npcId: -1, // Special ID for event-triggered dialogue
                executionMode: EXECUTION_MODES.SEQUENTIAL
            }
        ]
    },

    PARALLEL_DEMO: {
        description: "NPC talks while moving",
        subEvents: [
            {
                type: SUBEVENT_TYPES.NPC_DIALOGUE,
                npcId: -2, // Another special ID
                executionMode: EXECUTION_MODES.PARALLEL
            },
            {
                type: SUBEVENT_TYPES.MOVE_PLAYER,
                targetX: 5,
                targetY: 3,
                speed: 1,
                executionMode: EXECUTION_MODES.PARALLEL
            }
        ]
    }
};

// Event-specific dialogue (using same format as NPCs)
export const EVENT_DIALOGUE = {
    "-1": [ // Matches npcId in TEST_EVENT
        "This is a test event!", 
        "It works!"
    ],
    "-2": [ // Matches npcId in PARALLEL_DEMO
        "Watch me move and talk at the same time!"
    ]
};
