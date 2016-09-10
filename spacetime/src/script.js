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

planetMass = 1;
gravityPower = 25000;
players = [];
cpus = [];
glitches = [];

createPlayer = () => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    topLayer.appendChild(playerNode);
    players.push({
        id: Math.floor(Math.random() * 1000000),
        translate: playerNode,
        rotate: playerNode.children[0],
        rotationPointX: 16,
        rotationPointY: 4,

        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        direction: 0,
        speed: 0,

        maxSpeed: 10,
        acceleration: 0.4,
        friction: 1.1,

        turnSpeed: 0,
        maxTurnSpeed: 5,
        turnAcceleration: 0.5,
        turnFriction: 1.2,

        shoot: false,
        reloading: 0,
        reloadTime: 10,
        gunMount: 0,
        gunMounts: [10, -10],
        
        glitch: 0,
        glitchTime: 30,
        glitchLog: [],
    });
};

createCpu = () => {
    createPlayer();
    cpus.push(players.pop());
};

createPlayer();
//createPlayer();
createCpu();

planets = [];
createPlanet = () => {
    let planetNode = planet.cloneNode(true);
    planetNode.id = '';
    topLayer.appendChild(planetNode);
    planets.push({
        id: Math.floor(Math.random() * 1000000),
        translate: planetNode,
        rotate: planetNode,
        rotationPointX: 0,
        rotationPointY: 0,

        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        direction: 0,
        speed: 0,
    });
};

createPlanet();
createPlanet();
createPlanet();
createPlanet();
createPlanet();
createPlanet();
createPlanet();

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

updatePlayer = (player) => {
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
    if (player.shoot && player.reloading < 0) {
        player.reloading = player.reloadTime;

        bulletClone = bullet.cloneNode(true);
        bulletClone.id = '';
        topLayer.appendChild(bulletClone);
        bullets.push({
            owner: player,
            translate: bulletClone,
            rotate: bulletClone,
            rotationPointX: 0,
            rotationPointY: 0,
            x: player.x + lengthDirX(player.gunMounts[player.gunMount], player.direction + 90),
            y: player.y + lengthDirY(player.gunMounts[player.gunMount], player.direction + 90),
//            direction: pointDirection(player.x, player.y, mouseX, mouseY),
            direction: player.direction,
            speed: 20,
            life: 200,
            mass: 0.8,
        });
        
        player.gunMount++;
        if (player.gunMount >= player.gunMounts.length) {
            player.gunMount = 0;
        }
    }
    player.shoot = false;
};

col = (bullet, ships) => {
    for (let j = 0; j < ships.length; j++) {
        if (bullet.owner.id == ships[j].id) {
            continue;
        }
        collisionDistance = pointDistance(bullet.x, bullet.y, ships[j].x, ships[j].y);
        if (collisionDistance < 20) {
            createExplosion(bullet.x, bullet.y);

            bullet.life = 0;
            break;
        }
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
        updatePlayer(players[i]);
    }
    for (let i = 0; i < cpus.length; i++) {
        ai(cpus[i]);
        updatePlayer(cpus[i]);
    }

    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].glitchLog[0]) {
            move(glitches[i].translate, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]);
            rotate(glitches[i].rotate, glitches[i].glitchLog[0][2], 16, 4);
        }
        if (!glitches[i].glitchLog.shift()) {
            glitches[i].translate.remove();
            glitches.splice(i, 1);
        }
    }

    moveGameObjects(players);
    moveGameObjects(cpus);
    moveGameObjects(bullets);
    moveGameObjects(planets);
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < planets.length; j++) {
            let r = pointDistance(bullets[i].x, bullets[i].y, planets[j].x, planets[j].y);
            let dir = pointDirection(bullets[i].x, bullets[i].y, planets[j].x, planets[j].y);
            let ttt = motionAdd(bullets[i].speed, bullets[i].direction, 1 / bullets[i].mass * gravityPower * (bullets[i].mass * planetMass) / (r * r), dir);
            bullets[i].speed = ttt[0];
            bullets[i].direction = ttt[1];
        }

        // Collide with ships
        col(bullets[i], players);
        col(bullets[i], cpus);
        
        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            createExplosion(bullets[i].x, bullets[i].y);

            bullets[i].translate.remove();
            bullets.splice(i, 1);
        }
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

window.addEventListener('gamepadconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
window.addEventListener('gamepaddisconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
