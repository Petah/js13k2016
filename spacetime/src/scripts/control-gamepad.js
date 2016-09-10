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
        players[playerIndex].x += Math.random() * 200 - 100;
        players[playerIndex].y += Math.random() * 200 - 100;
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
    players[playerIndex].glitchLog.push([players[playerIndex].x, players[playerIndex].y, players[playerIndex].direction]);

    
    if (gamepads[playerIndex].buttons[7].value > 0.2 && players[playerIndex].speed < gamepads[playerIndex].buttons[7].value * players[playerIndex].maxSpeed) {
        players[playerIndex].speed = Math.min(players[playerIndex].speed + (gamepads[playerIndex].buttons[7].value * players[playerIndex].acceleration), players[playerIndex].maxSpeed);
    } else {
        players[playerIndex].speed /= players[playerIndex].friction;
    }

    if (gamepads[playerIndex].axes[0] > 0.3 || gamepads[playerIndex].axes[0] < -0.3) {
        players[playerIndex].turnSpeed = Math.round(gamepads[playerIndex].axes[0] * players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }
};
