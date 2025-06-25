// gameScripts.js 
import { SUBEVENT_TYPES, EXECUTION_MODES } from './eventTypes.js';

export const EVENT_DIALOGUE = {
    "-1": [
        "This is a test event!", 
        "It works!"
    ],
    "-2": [
        "Watch me move and talk at the same time!"
    ]
};

export const GAME_EVENTS = {
    TEST_EVENT: {
        description: "Test dialogue event",
        subEvents: [
            {
                type: SUBEVENT_TYPES.NPC_DIALOGUE,
                npcId: -1,
                executionMode: EXECUTION_MODES.SEQUENTIAL
            }
        ]
    },
    PARALLEL_DEMO: {
        description: "NPC talks while moving",
        subEvents: [
            {
                type: SUBEVENT_TYPES.NPC_DIALOGUE,
                npcId: -2,
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
