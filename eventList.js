export const Events = {
    introScene: {
        steps: [
            [ // Step 1: Move player
                { type: "movePlayer", x: 5, y: 5 }
            ],
            [ // Step 2: Dialogue
                { 
                    type: "dialogue", 
                    lines: [
                        "Hello there...",
                        "Welcome to the nightmare dungeon.",
                        "You won't leave here easily."
                    ] 
                }
            ],
            [ // Step 3: Wait (for pacing)
                { type: "wait", duration: 60 } // 60 frames (~1 second)
            ],
            [ // Step 4: Another Dialogue
                { 
                    type: "dialogue", 
                    lines: ["...Good luck."]
                }
            ]
        ]
    }
};
