stateDeadInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'block';
    state = stateDead;
    if (timeElapsedID) {
        clearInterval(timeElapsedID);
        timeElapsedID = false;
        timeElapsed = 0;
    }
    while (players.length) {
        destroy(players, 0);
    }
    while (cpus.length) {
        destroy(cpus, 0);
    }
    while (particles.length) {
        destroy(particles, 0);
    }
    while (bullets.length) {
        destroy(bullets, 0);
    }
    while (glitches.length) {
        destroy(glitches, 0);
    }
    while (planets.length) {
        destroy(planets, 0);
    }
    while (hudLayer.firstChild) {
        hudLayer.removeChild(hudLayer.firstChild);
    }
};

stateDead = () => {
    if (buttonShootDown) {
        stateGameInit();
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]  && gamepads[i].mapping === 'standard' && gamepads[i].buttons[9].pressed) {
            stateGameInit();
        }
    }
};
