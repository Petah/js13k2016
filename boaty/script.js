move = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

rotate = (element, angle, rotationPointX, rotationPointY) => {
    element.transform.baseVal[1].setRotate(angle, rotationPointX, rotationPointY)
};

player = {
    translate: boatWrapper,
    rotate: boat,
    rotationPointX: 16,
    rotationPointY: 4,
    
    x: 100,
    y: 100,
    direction: 0,
    speed: 0,
    
    maxSpeed: 2,
    acceleration: 0.01,
    
    turnSpeed: 0,
    maxTurnSpeed: 2,
    turnAcceleration: 0.02,
    
    reloading: 0,
    reloadTime: 50,
};

gameObjects = [player];
particles = [];

emitter = {
    particle: bubbleParticle,
    reloading: 0,
    reloadTime: 1,
    amount: 1,
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
mouseMoveDown = false;
mouseShootDown = false;

svgNode.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
};

svgNode.onmousedown = (e) => {
    if (e.which == 1) {
        mouseMoveDown = true;
    }
    if (e.which == 3) {
        mouseShootDown = true;
    }
    e.preventDefault();
};

svgNode.onmouseup = (e) => {
    if (e.which == 1) {
        mouseMoveDown = false;
    }
    if (e.which == 3) {
        mouseShootDown = false;
    }
    e.preventDefault();
};

svgNode.oncontextmenu = (e) => {
    e.preventDefault();
};

sun = 0;

main = () => {
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
    
    player.direction += player.turnSpeed;
    
    while (player.direction > 360) {
        player.direction -= 360;
    }
    while (player.direction < 0) {
        player.direction += 360;
    }
    
    emitter.reloading--;
    if (emitter.reloading < 0 && player.speed > 0.1) {
        emitter.reloading = emitter.reloadTime;
        
        for (i = 0; i < emitter.amount; i++) {
            particleClone = emitter.particle.cloneNode(true);
            particleClone.id = '';
            bottomLayer.appendChild(particleClone);
            particles.push({
                x: player.x + ((Math.random() * 4) - 2),
                y: player.y + ((Math.random() * 4) - 2),
                translate: particleClone,
                life: 30,
                speed: player.speed / 10,
                direction: (player.direction - 180) + ((Math.random() * 30) - 15),
            });
        }
    }
    
    player.reloading--;
    if (mouseShootDown && player.reloading < 0) {
        player.reloading = player.reloadTime;
        
        bulletClone = bullet.cloneNode(true);
        bulletClone.id = '';
        topLayer.appendChild(bulletClone);
        gameObjects.push({
            translate: bulletClone,
            rotate: bulletClone,
            rotationPointX: 0,
            rotationPointY: 0,
            x: player.x,
            y: player.y,
            direction: pointDirection(player.x, player.y, mouseX, mouseY),
            speed: 10,
        });
    }
    
    for (i = 0; i < gameObjects.length; i++) {
        gameObjects[i].x += lengthDirX(gameObjects[i].speed, gameObjects[i].direction);
        gameObjects[i].y += lengthDirY(gameObjects[i].speed, gameObjects[i].direction);

        move(gameObjects[i].translate, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].rotate, gameObjects[i].direction, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
    
    for (i = 0; i < particles.length; i++) {
        particles[i].x += lengthDirX(particles[i].speed, particles[i].direction);
        particles[i].y += lengthDirY(particles[i].speed, particles[i].direction);
        particles[i].translate.style.opacity -= 0.01;

        move(particles[i].translate, particles[i].x, particles[i].y);
//        rotate(particles[i].rotate, particles[i].direction, particles[i].rotationPointX, particles[i].rotationPointY);
        particles[i].life--;
        if (particles[i].life < 0) {
            particles[i].translate.remove();
            particles.splice(i, 1);
        }
    }
    
    lightingPointLight.x.baseVal = Math.sin(sun) * 2000;
    lightingPointLight.z.baseVal = Math.sin(sun) * 300;
    sun += 0.0001;
    
    requestAnimationFrame(main);
};

main();
