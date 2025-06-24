export const GAME_EVENTS = {
    EVENT_0: {
        description: "Intro cutscene - NPC greets player and moves them",
        subEvents: [
            {
                type: "DIALOGUE",
                lines: ["Welcome to the dungeon!", "Follow me..."],
                isBlocking: true // Pauses other sub-events until done
            },
            {
                type: "MOVE_PLAYER",
                targetX: 5,
                targetY: 3,
                speed: 2,
                isBlocking: true
            }
        ]
    }
};
