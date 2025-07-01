export const Events = {
    complexScene: {
        steps: [
            [ // Step 1
                { 
                    type: "dialogue", 
                    lines: [
                        "Hey... are you seeing this?"
                    ] 
                },
                { 
                    type: "group",
                    steps: [
                        [ { type: "wait", duration: 60 } ], // Wait 1 second
                        [ { type: "movePlayer", x: 5, y: 5 } ] // Then move
                    ]
                }
            ],
            [ // Step 2
                { 
                    type: "dialogue", 
                    lines: [
                        "Well... that just happened."
                    ] 
                }
            ]
        ]
    }
};
