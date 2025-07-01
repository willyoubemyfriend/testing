export const Events = {
    testNested: {
        steps: [
            [ // Step 1 — runs in parallel
                { 
                    type: "dialogue", 
                    lines: ["I will talk while you wait and move."] 
                },
                { 
                    type: "group", 
                    steps: [
                        [ { type: "wait", duration: 60 } ],          // Wait 1 second
                        [ { type: "movePlayer", x: 5, y: 5 } ],      // Move
                        [ { type: "wait", duration: 30 } ],          // Wait half a second
                        [ { type: "movePlayer", x: 7, y: 7 } ]       // Move again
                    ]
                }
            ],
            [ // Step 2 — after everything in step 1
                { 
                    type: "dialogue", 
                    lines: ["Done! That was cool."] 
                }
            ]
        ]
    }
};
