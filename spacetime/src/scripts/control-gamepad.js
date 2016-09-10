controlUpdate = () => {   
    let gamepads = navigator.getGamepads();
    if (gamepads[0].buttons[0].pressed) {
        buttonShootDown = true;
    } else {
        buttonShootDown = false;
    }
    
    if (gamepads[0].axes[0] < -0.5) {
        buttonTurnLeftDown = true;
        buttonTurnRightDown = false;
    } else if (gamepads[0].axes[0] > 0.5) {
        buttonTurnLeftDown = false;
        buttonTurnRightDown = true;
    }
    
    if (gamepads[0].buttons[7].value > 0.2 && player.speed < gamepads[0].buttons[7].value * player.maxSpeed) {
        player.speed = Math.min(player.speed + (gamepads[0].buttons[7].value * player.acceleration), player.maxSpeed);
    } else {
        player.speed /= player.friction;
    }

    if (gamepads[0].axes[0] > 0.2 || gamepads[0].axes[0] < -0.2) {
        player.turnSpeed = Math.round(gamepads[0].axes[0] * player.maxTurnSpeed);
    } else {
        player.turnSpeed /= player.turnFriction;
    }
};
