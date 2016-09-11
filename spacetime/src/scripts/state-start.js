stateStartInit = () => {
    svgStartNode.style.display = 'block';
    svgDeadNode.style.display = 'none';
    state = stateStart;
};

stateStart = () => {
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].buttons[9].pressed) {
            stateGameInit();
        }
    }
};
