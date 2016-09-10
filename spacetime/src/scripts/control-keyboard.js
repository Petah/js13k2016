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

controlUpdate = () => {   
    if (buttonMoveDown) {
        player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
    } else {
        player.speed /= player.friction;
    }

    if (buttonTurnLeftDown) {
        player.turnSpeed = Math.max(player.turnSpeed - player.turnAcceleration, -player.maxTurnSpeed);
    } else if (buttonTurnRightDown) {
        player.turnSpeed = Math.min(player.turnSpeed + player.turnAcceleration, player.maxTurnSpeed);
    } else {
        player.turnSpeed /= player.turnFriction;
    }
};
    