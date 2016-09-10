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

players = [];

createPlayer = () => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    topLayer.appendChild(playerNode);
    players.push({
        translate: playerNode,
        rotate: playerNode.children[0],
        rotationPointX: 16,
        rotationPointY: 4,

        x: 500,
        y: 500,
        direction: 0,
        speed: 0,

        maxSpeed: 10,
        acceleration: 0.4,
        friction: 1.1,

        turnSpeed: 0,
        maxTurnSpeed: 5,
        turnAcceleration: 0.5,
        turnFriction: 1.2,

        reloading: 0,
        reloadTime: 10,
    });
};

createPlayer();
createPlayer();

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

moveGameObjects = (gameObjects) => {
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].x += lengthDirX(gameObjects[i].speed, gameObjects[i].direction);
        gameObjects[i].y += lengthDirY(gameObjects[i].speed, gameObjects[i].direction);

        move(gameObjects[i].translate, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].rotate, gameObjects[i].direction, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
};

createExplosion = (x, y) => {
    console.log(x, y);
    for (let i = 0; i < 16; i++) {
        explosionClone = explosion.cloneNode(true);
        explosionClone.id = '';
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
    updatedPerSecond++;
    if (updatedPerSecondTimer < performance.now()) {
        ups.innerHTML = 'UPS: ' + updatedPerSecond;
        updatedPerSecondTimer = performance.now() + 1000;
        updatedPerSecond = 0;
    }
    ///debug
    
    
    for (let i = 0; i < players.length; i++) {
        controlUpdate(i);
        
        players[i].direction += players[i].turnSpeed;

        while (players[i].direction > 360) {
            players[i].direction -= 360;
        }
        while (players[i].direction < 0) {
            players[i].direction += 360;
        }

        emitter.reloading--;
        if (emitter.reloading < 0 && players[i].speed > 0.1) {
            emitter.reloading = emitter.reloadTime;

            for (let i = 0; i < emitter.amount; i++) {
                particleClone = emitter.particle.cloneNode(true);
                particleClone.id = '';
                bottomLayer.appendChild(particleClone);
                particles.push({
                    x: players[i].x + ((Math.random() * 4) - 2),
                    y: players[i].y + ((Math.random() * 4) - 2),
                    translate: particleClone,
                    life: 30,
                    speed: players[i].speed / 10,
                    direction: (players[i].direction - 180) + ((Math.random() * 30) - 15),
                    animate: bubbleParticleAnimation,
                });
            }
        }

        players[i].reloading--;
        if (buttonShootDown && players[i].reloading < 0) {
            players[i].reloading = players[i].reloadTime;

            bulletClone = bullet.cloneNode(true);
            bulletClone.id = '';
            topLayer.appendChild(bulletClone);
            bullets.push({
                owner: i,
                translate: bulletClone,
                rotate: bulletClone,
                rotationPointX: 0,
                rotationPointY: 0,
                x: players[i].x,
                y: players[i].y,
    //            direction: pointDirection(players[i].x, players[i].y, mouseX, mouseY),
                direction: players[i].direction,
                speed: 20,
            });
        }
    }
//    console.log(players[0].rotate.getCTM().e, players[0].translate.getCTM().f);
    moveGameObjects(players);
    moveGameObjects(bullets);
    for (let i = 0; i < bullets.length; i++) {
//        console.log(bullets[i]);

        for (let j = 0; j < players.length; j++) {
            if (bullets[i].owner == j) {
                continue;
            }
            //console.log(calculateRealPosition(bullets[i].rotate), calculateRealPosition(players[j].rotate));
            collision = intersectPolygonPolygon(calculateRealPosition(bullets[i].rotate), calculateRealPosition(players[j].rotate));
            if (collision.length) {
                console.log(collision);
                createExplosion(collision[0][0], collision[0][1]);

                bullets[i].translate.remove();
                bullets.splice(i, 1);
                j = players.length;
            }
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
    
    svgNode.viewBox.baseVal.x = players[0].x - window.innerWidth / 2;
    svgNode.viewBox.baseVal.y = players[0].y - window.innerHeight / 2;
    svgNode.viewBox.baseVal.width = window.innerWidth;
    svgNode.viewBox.baseVal.height = window.innerHeight;
    
    requestAnimationFrame(main);
};

main();

go = () => {
    console.log(intersectPolygonPolygon(calculateRealPosition(boat), land.points));
};

setInterval(() => {
    
}, 100);

window.addEventListener('gamepadconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
window.addEventListener('gamepaddisconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
