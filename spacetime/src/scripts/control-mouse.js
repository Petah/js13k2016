mouseX = 0;
mouseY = 0;
mouseMoveDown = false;
mouseShootDown = false;

document.body.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

document.body.onmousedown = (e) => {
    if (e.which == 1) {
        mouseMoveDown = true;
    }
    if (e.which == 3) {
        mouseShootDown = true;
    }
    e.preventDefault();
};

document.body.onmouseup = (e) => {
    if (e.which == 1) {
        mouseMoveDown = false;
    }
    if (e.which == 3) {
        mouseShootDown = false;
    }
    e.preventDefault();
};

document.body.oncontextmenu = (e) => {
    e.preventDefault();
};

controlMouseUpdate = () => {   
    if (mouseMoveDown) {
        player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
        directionDelta = (player.direction - pointDirection(player.x, player.y, mouseX, mouseY) + 360) % 360;
        if (directionDelta < 180) {
            if (directionDelta > 10) {
                player.turnSpeed = Math.max(player.turnSpeed - player.turnAcceleration, -player.maxTurnSpeed);
            } else {
                player.turnSpeed /= 1.2;
            }
        } else if (directionDelta > 180) {
            if (directionDelta < 350) {
                player.turnSpeed = Math.min(player.turnSpeed + player.turnAcceleration, player.maxTurnSpeed);
            } else {
                player.turnSpeed /= 1.2;
            }
        }
    } else {
        player.speed = Math.max(player.speed - player.acceleration, 0);
        player.turnSpeed /= 1.2;
    }
};
