move = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

rotate = (element, angle, rotationPointX, rotationPointY) => {
    element.transform.baseVal[1].setRotate(angle, rotationPointX, rotationPointY);
};

createExplosion = (x, y, sound) => {
    playSound(sound, x, y);
    for (let i = 0; i < 16; i++) {
        if (!nodeExplosions.length) {
            return;
        }
        explosionClone = nodeExplosions.pop();
        explosionClone.style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i / 4)];
        explosionClone.r.baseVal.value = 10;
        explosionClone.style.opacity = 1;
        explosionClone.style.display = '';
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
            destroy: (node) => {
                node.style.display = 'none';
                nodeExplosions.push(node);
            },
        });
    }
};
    
emit = (emitter, x, y, speed, direction) => {
    emitter.reloading--;
    if (emitter.reloading < 0) {
        emitter.reloading = emitter.reloadTime;

        for (let i = 0; i < emitter.amount; i++) {
            if (!nodeBubbles.length) {
                return;
            }
            particleClone = nodeBubbles.pop();
            particleClone.style.opacity = 1;
            particleClone.style.display = '';
            particles.push({
                x: x + lengthDirX(-speed, direction),
                y: y + lengthDirY(-speed, direction),
                translate: particleClone,
                life: 30,
                speed: speed / 10,
                direction: (direction - 180) + ((Math.random() * 30) - 15),
                animate: (particle) => {
                    particle.translate.style.opacity -= 0.04;
                },
                destroy: (node) => {
                    node.style.display = 'none';
                    nodeBubbles.push(node);
                },
            });
        }
    }
};

applyGravity = (self) => {
    for (let j = 0; j < planets.length; j++) {
        let planetDistance = pointDistance(self.x, self.y, planets[j].x, planets[j].y);
        let planetDirection = pointDirection(self.x, self.y, planets[j].x, planets[j].y);
        motionAdd(self, 1 / self.mass * gravityPower * (self.mass * planets[j].mass) / (planetDistance * planetDistance), planetDirection);
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

moveGameObjects2 = (gameObjects) => {
    for (let i = 0; i < gameObjects.length; i++) {
        motionAdd(gameObjects[i], gameObjects[i].currentAcceleration, gameObjects[i].facing);
        gameObjects[i].speed = Math.min(gameObjects[i].speed, gameObjects[i].maxSpeed);
        gameObjects[i].x += lengthDirX(gameObjects[i].speed, gameObjects[i].direction);
        gameObjects[i].y += lengthDirY(gameObjects[i].speed, gameObjects[i].direction);

        move(gameObjects[i].translate, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].rotate, gameObjects[i].facing, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
};

destroy = (gameObjects, i) => {
    if (gameObjects[i].destroy) {
        gameObjects[i].destroy(gameObjects[i].translate);
    } else {
        gameObjects[i].translate.remove();
    }
    gameObjects.splice(i, 1);
};
