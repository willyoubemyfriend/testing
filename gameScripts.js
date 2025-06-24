export const GAME_EVENTS = {
    TEST_EVENT: {
        description: "Test dialogue event",
        subEvents: [
            {
                type: "DIALOGUE",
                lines: ["This is a test event!", "It works!"],
                isBlocking: true,
                isStarted: false,
                isComplete: false
            }
        ]
    }
};
