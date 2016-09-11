controlUpdate = (playerIndex) => {   
    let gamepads = navigator.getGamepads();
    if (!gamepads[playerIndex]) {
        return;
    }
    if (gamepads[playerIndex].buttons[0].pressed) {
        players[playerIndex].shoot = true;
    }

    players[playerIndex].glitch--;
    if (gamepads[playerIndex].buttons[2].pressed && players[playerIndex].glitch < 0) {
        players[playerIndex].glitch = players[playerIndex].glitchTime;
        players[playerIndex].x += Math.random() * 2000 - 1000;
        players[playerIndex].y += Math.random() * 2000 - 1000;
        let playerNode = boatWrapper.cloneNode(true);
        playerNode.id = '';
        topLayer.appendChild(playerNode);
        glitches.push({
            translate: playerNode,
            rotate: playerNode.children[0],
            glitchLog: players[playerIndex].glitchLog,
        });
        players[playerIndex].glitchLog = [];
    }
    players[playerIndex].glitchLog.push([players[playerIndex].x, players[playerIndex].y, players[playerIndex].facing]);

    if (gamepads[playerIndex].buttons[7].value > 0.2) {
        players[playerIndex].currentAcceleration = gamepads[playerIndex].buttons[7].value * players[playerIndex].acceleration;
    } else {
        players[playerIndex].currentAcceleration = 0;
    }

    if (gamepads[playerIndex].axes[0] > 0.3 || gamepads[playerIndex].axes[0] < -0.3) {
        players[playerIndex].turnSpeed = Math.round(gamepads[playerIndex].axes[0] * players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }

    if (gamepads[playerIndex].buttons[6].pressed) {
        zoom += 0.1;
        zoom = Math.min(10, zoom);
    }
    if (gamepads[playerIndex].buttons[4].pressed) {
        zoom -= 0.1;
        zoom = Math.max(0.1, zoom);
    }
};
