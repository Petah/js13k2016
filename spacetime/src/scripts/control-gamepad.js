controlGamepadUpdate = (playerIndex, gamepadIndex) => {   
    let gamepads = navigator.getGamepads();
    if (!gamepads[gamepadIndex]) {
        return;
    }
    if (gamepads[gamepadIndex].buttons[0].pressed) {
        players[playerIndex].shoot = true;
    }

    if (gamepads[gamepadIndex].buttons[2].pressed) {
        players[playerIndex].glitch = true;
    }

    if (gamepads[gamepadIndex].buttons[7].value > 0.2) {
        players[playerIndex].currentAcceleration = gamepads[gamepadIndex].buttons[7].value * players[playerIndex].acceleration;
    } else {
        players[playerIndex].currentAcceleration = 0;
    }

    if (gamepads[gamepadIndex].axes[0] > 0.3 || gamepads[gamepadIndex].axes[0] < -0.3) {
        players[playerIndex].turnSpeed = Math.round(gamepads[gamepadIndex].axes[0] * players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }

    if (gamepads[gamepadIndex].buttons[6].pressed) {
        zoom += 0.1;
        zoom = Math.min(10, zoom);
    }
    if (gamepads[gamepadIndex].buttons[4].pressed) {
        zoom -= 0.1;
        zoom = Math.max(0.1, zoom);
    }
};
