import { SUBEVENT_TYPES } from './eventSystem.js';

export const GAME_EVENTS = {
    TEST_EVENT: {
        description: "Test dialogue event",
        subEvents: [
            {
                type: SUBEVENT_TYPES.DIALOGUE, // Using the exported constant
                lines: ["This is a test event!", "It works!"],
                isBlocking: true,
                isStarted: false,
                isComplete: false
            }
        ]
    }
};
