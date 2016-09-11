buttonMoveDown = false;
buttonShootDown = false;
buttonTurnLeftDown = false;
buttonTurnRightDown = false;

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
    if (e.which == 32) {
        buttonShootDown = true;
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
    if (e.which == 32) {
        buttonShootDown = false;
    }
};

controlUpdate = (playerIndex) => {
    if (buttonMoveDown) {
        players[playerIndex].speed = Math.min(players[playerIndex].speed + players[playerIndex].acceleration, players[playerIndex].maxSpeed);
    } else {
        players[playerIndex].speed /= players[playerIndex].friction;
    }

    if (buttonTurnLeftDown) {
        players[playerIndex].turnSpeed = Math.max(players[playerIndex].turnSpeed - players[playerIndex].turnAcceleration, -players[playerIndex].maxTurnSpeed);
    } else if (buttonTurnRightDown) {
        players[playerIndex].turnSpeed = Math.min(players[playerIndex].turnSpeed + players[playerIndex].turnAcceleration, players[playerIndex].maxTurnSpeed);
    } else {
        players[playerIndex].turnSpeed /= players[playerIndex].turnFriction;
    }

    if (buttonShootDown) {
        players[playerIndex].shoot = true;
    }
};
