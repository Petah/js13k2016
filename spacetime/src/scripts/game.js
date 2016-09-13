move = (node, x, y) => {
    for (let i = 0; i < node.elements.length; i++) {
        node.elements[i].transform.baseVal[0].matrix.e = x;
        node.elements[i].transform.baseVal[0].matrix.f = y;
    }
};

rotate = (node, angle, rotationPointX, rotationPointY) => {
    for (let i = 0; i < node.elements.length; i++) {
        node.elements[i].children[0].transform.baseVal[1].setRotate(angle, rotationPointX, rotationPointY);
    }
};

createExplosion = (x, y, sound) => {
    playSound(sound, x, y);
    for (let i = 0; i < 8 * quality; i++) {
        particles.push({
            x: x + ((Math.random() * 20) - 10),
            y: y + ((Math.random() * 20) - 10),
            node: nodeCreate('explosion', '.topLayer', (element) => {
                element.children[0].style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i / 2)];
            }),
            life: 50,
            speed: Math.random() / 4,
            direction: Math.random() * 360,
            animate: (particle) => {
                particle.node.elements.forEach((element) => {
                    element.children[0].r.baseVal.value = particle.life / 2 + 20;
                    element.children[0].style.opacity = 1 / 50 * particle.life;
                });
            },
        });
    }
};
    
emit = (emitter, x, y, speed, direction) => {
    if (Math.random() > quality) {
        return;
    }
    emitter.reloading--;
    if (emitter.reloading < 0) {
        emitter.reloading = emitter.reloadTime;
        for (let i = 0; i < emitter.amount; i++) {
            particles.push({
                x: x + lengthDirX(-speed, direction),
                y: y + lengthDirY(-speed, direction),
                node: nodeCreate('bubbleParticle', '.bottomLayer'),
                life: 120,
                speed: speed / 10,
                direction: (direction - 180) + ((Math.random() * 30) - 15),
                animate: (particle) => {
                    particle.node.elements.forEach((element) => {
                        element.children[0].style.opacity = 1 / 30 * particle.life;
                    });
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

        move(gameObjects[i].node, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].node, gameObjects[i].direction, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
};

moveGameObjects2 = (gameObjects) => {
    for (let i = 0; i < gameObjects.length; i++) {
        motionAdd(gameObjects[i], gameObjects[i].currentAcceleration, gameObjects[i].facing);
        gameObjects[i].speed = Math.min(gameObjects[i].speed, gameObjects[i].maxSpeed);
        gameObjects[i].x += lengthDirX(gameObjects[i].speed, gameObjects[i].direction);
        gameObjects[i].y += lengthDirY(gameObjects[i].speed, gameObjects[i].direction);

        move(gameObjects[i].node, gameObjects[i].x, gameObjects[i].y);
        rotate(gameObjects[i].node, gameObjects[i].facing, gameObjects[i].rotationPointX, gameObjects[i].rotationPointY);
    }
};

destroy = (gameObjects, i) => {
    nodeDestroy(gameObjects[i].node);
//    if (gameObjects[i].destroy) {
//        gameObjects[i].destroy(gameObjects[i].translate);
//    } else {
//        for (let j = 0; j < gameObjects[j].translate.length; j++) {
//            gameObjects[i].translate[j].remove();
//        }
//    }
    gameObjects.splice(i, 1);
};
