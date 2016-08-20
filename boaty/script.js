//debug
updatedPerSecond = 0;
updatedPerSecondTimer = performance.now();
///debug

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
    
    x: 500,
    y: 500,
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

bullets = [];
particles = [];

emitter = {
    particle: bubbleParticle,
    reloading: 0,
    reloadTime: 1,
    amount: 1,
};

bubbleParticleAnimation = (particle) => {
    particle.translate.style.opacity -= 0.01;
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

moveGameObjects = (gameObjects) => {
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].x += lengthDirX(gameObjects[i].speed, gameObjects[i].direction);
        gameObjects[i].y += lengthDirY(gameObjects[i].speed, gameObjects[i].direction);

        move(gameObjects[i].translate, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].rotate, gameObjects[i].direction, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
};

createExplosion = (x, y) => {
    for (let i = 0; i < 16; i++) {
        explosionClone = explosion.cloneNode(true);
        explosionClone.id = '';
        console.log(explosionClone.style.fill);
        explosionClone.style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i / 4)];
        topLayer.appendChild(explosionClone);
        particles.push({
            x: x + ((Math.random() * 10) - 5),
            y: y + ((Math.random() * 10) - 5),
            translate: explosionClone,
            life: 5000,
            speed: Math.random() / 2,
            direction: Math.random() * 360,
            animationState: 0,
            animationSpeed: Math.random() * 2 + 5,
            animate: (particle) => {
                particle.animationState += particle.animationSpeed;
                particle.translate.r.baseVal.value = -(Math.cos(particle.animationState * (Math.PI / 100)) - 1) * 5;
                particle.translate.style.opacity -= 0.02;
                if (particle.animationState > 200) {
                    particle.life = 0;
                }
            },
        });
    }
};

main = () => {
    //debug
//    console.log(updatedPerSecond);
    updatedPerSecond++;
    if (updatedPerSecondTimer < performance.now()) {
        ups.innerHTML = 'UPS: ' + updatedPerSecond;
        updatedPerSecondTimer = performance.now() + 1000;
        updatedPerSecond = 0;
    }
    ///debug
    
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
        
        for (let i = 0; i < emitter.amount; i++) {
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
                animate: bubbleParticleAnimation,
            });
        }
    }
    
    player.reloading--;
    if (mouseShootDown && player.reloading < 0) {
        player.reloading = player.reloadTime;
        
        bulletClone = bullet.cloneNode(true);
        bulletClone.id = '';
        topLayer.appendChild(bulletClone);
        bullets.push({
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
    
    moveGameObjects([player]);
    moveGameObjects(bullets);
    for (let i = 0; i < bullets.length; i++) {
//        console.log(bullets[i]);
        collision = intersectPolygonPolygon(calculateRealPosition(bullets[i].rotate), land.points);
        if (collision.length) {
            createExplosion(collision[0][0], collision[0][1]);
            
            bullets[i].translate.remove();
            bullets.splice(i, 1);
        }
//        console.log(intersectPolygonPolygon(calculateRealPosition(boat), land.points));
    }
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += lengthDirX(particles[i].speed, particles[i].direction);
        particles[i].y += lengthDirY(particles[i].speed, particles[i].direction);
        particles[i].animate(particles[i]);

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

go = () => {
    console.log(intersectPolygonPolygon(calculateRealPosition(boat), land.points));
};

setInterval(() => {
    
}, 100);

randomLandPoints = '0 0 ';
currentX = 0;
currentY = 100;
while (currentX < 2000) {
    currentY += ((Math.random() * 10) - 5);
    randomLandPoints += ' ' + currentX + ' ' + currentY;
    currentX += 10;
}
randomLandPoints += ' ' + (currentX - 10) + ' 0';
land.setAttribute('points', randomLandPoints);
