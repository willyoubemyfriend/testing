export const Events = {
    complexScene: {
        steps: [
            [
                { 
                    type: "dialogue", 
                    lines: ["Hey... are you seeing this?"] 
                },
                { 
                    type: "group",
                    steps: [
                        [{ type: "wait", duration: 60 }],
                        [{ type: "movePlayer", x: 5, y: 5 }]
                    ]
                }
            ],
            [
                { 
                    type: "dialogue", 
                    lines: ["Well... that just happened."] 
                }
            ]
        ]
    }
};
