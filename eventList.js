export const Events = {
    introScene: {
        steps: [
            [
                {
                    type: "movePlayerRelative",
                    dy: 1
                }
            ],
            [
                // Dialogue starts
                { 
                    type: "dialogue", 
                    lines: ["Welcome... to the pain chamber."] 
                },

                // Group: Wait 1 second, then move player (while dialogue is still active)
                {
                    type: "group",
                    steps: [
                        [ { type: "wait", duration: 60 } ],
                        [ { type: "movePlayer", x: 5, y: 5 } ]
                    ]
                }
            ],
            [
                { 
                    type: "dialogue", 
                    lines: ["...Hope you're ready."] 
                }
            ]
        ]
    },
    taciturnipScene: {
        steps: [
            [
                {
                    type: "dialogue",
                    lines: ["Oh, sorry. Am I in your way?", "Deepest apologies.", "No, literally. I'm very deeply rooted in the ground, you see.", "What were we doing again...? Oh yeah."]
                }
            ],
            [
                {
                    type: "moveNPC",
                    id: 1,
                    dx: -4
                }
            ]
        ]
    }
};
