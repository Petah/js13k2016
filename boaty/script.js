move = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

rotate = (element, angle) => {
    element.transform.baseVal[1].setRotate(angle, 16, 4)
};

player = {
    translate: boatWrapper,
    rotate: boat,
    
    x: 100,
    y: 100,
    direction: 0,
    
    speed: 0,
    maxSpeed: 2,
    acceleration: 0.1,
    
    turnSpeed: 0,
    maxTurnSpeed: 2,
    turnAcceleration: 0.1,
};

pointDirection = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

pointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
};

lengthDirX = (length, direction) => {
    return Math.cos(direction * Math.PI / 180) * length;
};

lengthDirY = (length, direction) => {
    return Math.sin(direction * Math.PI / 180) * length;
};

mouseX = 0;
mouseY = 0;
mouseDown = false;

svgNode.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

svgNode.onmousedown = (e) => {
    mouseDown = true;
};

svgNode.onmouseup = (e) => {
    mouseDown = false;
};

svgNode.oncontextmenu = (e) => {
    e.preventDefault();
};

sun = 0;

main = () => {
    if (mouseDown) {
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
    
    player.x += lengthDirX(player.speed, player.direction);
    player.y += lengthDirY(player.speed, player.direction);
    player.direction += player.turnSpeed;
    
    while (player.direction > 360) {
        player.direction -= 360;
    }
    while (player.direction < 0) {
        player.direction += 360;
    }
    
    move(player.translate, player.x, player.y);
    rotate(player.rotate, player.direction);
    
    lightingPointLight.x.baseVal = Math.sin(sun) * 2000;
    lightingPointLight.z.baseVal = Math.sin(sun) * 100;
    sun += 0.001;
    
    requestAnimationFrame(main);
};

main();
