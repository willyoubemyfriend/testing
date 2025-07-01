export const Events = {
    fancyScene: {
        steps: [
            [
                { type: "dialogue", lines: ["Watch me move while I talk..."] },
                { 
                    type: "group", steps: [
                        [ { type: "wait", duration: 60 } ], // Wait 1 second
                        [ { type: "movePlayer", x: 5, y: 5 } ], // Then move
                        [ { type: "wait", duration: 60 } ], // Then wait again
                        [ { type: "movePlayer", x: 7, y: 7 } ] // Then move again
                    ]
                }
            ],
            [
                { type: "dialogue", lines: ["And now I'm done."] }
            ]
        ]
    }
};
