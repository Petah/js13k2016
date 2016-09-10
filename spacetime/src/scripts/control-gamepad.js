controlUpdate = (playerIndex) => {   
    let gamepads = navigator.getGamepads();
    if (!gamepads[playerIndex]) {
        return;
    }
    if (gamepads[playerIndex].buttons[0].pressed) {
        buttonShootDown = true;
    } else {
        buttonShootDown = false;
    }
    
    if (gamepads[playerIndex].buttons[7].value > 0.2 && players[playerIndex].speed < gamepads[playerIndex].buttons[7].value * players[playerIndex].maxSpeed) {
        players[playerIndex].speed = Math.min(players[playerIndex].speed + (gamepads[playerIndex].buttons[7].value * players[playerIndex].acceleration), players[playerIndex].maxSpeed);
    } else {
        players[playerIndex].speed /= players[playerIndex].friction;
    }

    if (gamepads[playerIndex].axes[0] > 0.2 || gamepads[playerIndex].axes[0] < -0.2) {
        players[playerIndex].turnSpeed = Math.round(gamepads[playerIndex].axes[0] * players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }
};
