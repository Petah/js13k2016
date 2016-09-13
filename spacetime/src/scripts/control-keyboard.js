buttonMoveDown = false;
buttonShootDown = false;
buttonTurnLeftDown = false;
buttonTurnRightDown = false;
buttonGlitchDown = false;

document.body.onkeydown = (e) => {
    if (e.which == 38) {
        buttonMoveDown = true;
    }
    if (e.which == 37) {
        buttonTurnLeftDown = true;
    }
    if (e.which == 39) {
        buttonTurnRightDown = true;
    }
    if (e.which == 17) {
        buttonShootDown = true;
    }
    if (e.which == 16) {
        buttonGlitchDown = true;
    }
};

document.body.onkeyup = (e) => {
    if (e.which == 38) {
        buttonMoveDown = false;
    }
    if (e.which == 37) {
        buttonTurnLeftDown = false;
    }
    if (e.which == 39) {
        buttonTurnRightDown = false;
    }
    if (e.which == 17) {
        buttonShootDown = false;
    }
    if (e.which == 16) {
        buttonGlitchDown = false;
    }
};

controlKeyboardUpdate = (playerIndex) => {
    if (buttonMoveDown) {
        players[playerIndex].currentAcceleration = players[playerIndex].acceleration;
    }

    if (buttonTurnLeftDown) {
        players[playerIndex].turnSpeed = Math.max(players[playerIndex].turnSpeed - players[playerIndex].turnAcceleration, -players[playerIndex].maxTurnSpeed);
    } else if (buttonTurnRightDown) {
        players[playerIndex].turnSpeed = Math.min(players[playerIndex].turnSpeed + players[playerIndex].turnAcceleration, players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }

    if (buttonGlitchDown) {
        players[playerIndex].glitch = true;
    }

    if (buttonShootDown) {
        players[playerIndex].shoot = true;
    }
};
