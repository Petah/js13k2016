startTimer = null;
startCountDown = 0;
playerJoined = {};

stateStartInit = () => {
    svgStartNode.style.display = 'block';
    svgDeadNode.style.display = 'none';
    state = stateStart;
};

countDown = () => {
    startCountDown--;
    if (startCountDown <= 0) {
        stateGameInit();
    } else {
        startText.textContent = startCountDown;
        startTimer = setTimeout(countDown, 500)
    }
};

stateStart = () => {
    if (buttonShootDown && !playerJoined.keyboard) {
        playerJoined.keyboard = true;
        playerInputs.push([controlKeyboardUpdate]);
        if (startTimer) {
            clearTimeout(startTimer);
        }
        startText.classList.remove('blink');
        if (split && playerInputs.length < 2) {
            startText.textContent = 'Waiting for player 2';
        } else {
            startCountDown = 3;
            startText.textContent = startCountDown;
            startTimer = setTimeout(countDown, 500);
        }
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (!gamepads[i]) {
            continue;
        }
        for (let b = 0; b < gamepads[i].buttons.length; b++) {
            if (gamepads[i] && gamepads[i].buttons[b].pressed && !playerJoined['gamepad' + i]) {
                playerJoined['gamepad' + i] = true;
                playerInputs.push([controlGamepadUpdate, i]);
                if (startTimer) {
                    clearTimeout(startTimer);
                }
                if (split && playerInputs.length < 2) {
                    startText.textContent = 'Waiting for player 2';
                } else {
                    startText.classList.remove('blink');
                    startCountDown = 3;
                    startText.textContent = startCountDown;
                    startTimer = setTimeout(countDown, 500);
                }
            }
        }
    }
};
