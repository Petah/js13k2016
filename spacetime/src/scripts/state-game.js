stateGameInit = () => {
    updateTimeElapsed();

    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'none';
    state = stateGame;

    createSolarSystem(solarSystemData);

    playerInputs.forEach(() => {
        createPlayer({
            reloadTime: 5,
        });
    });

    createHud(hudData, players[0]);
    killCount.innerText = elapsedTime.innetText = '0';

    main(true);
}

stateGame = () => {
    // Move planets
    for (let i = 0; i < planets.length; i++) {
        planets[i].angle += planets[i].orbitSpeed;
        planets[i].x = lengthDirX(planets[i].distance, planets[i].angle);
        planets[i].y = lengthDirY(planets[i].distance, planets[i].angle);
        move(planets[i].node, planets[i].x, planets[i].y);
        for (let n = 0; n < planets[i].node.elements.length; n++) {
            planets[i].node.elements[n].children[planets[i].node.elements[n].children.length - 1].transform.baseVal[0].setRotate(pointDirection(0, 0, planets[i].x, planets[i].y), 0, 0);
        }
    }

    for (let i = 0; i < players.length; i++) {
        checkCollisions(players[i], planets);
        regenerateStat(players[i], 'life');
        regenerateStat(players[i], 'glitch');

        if (players[i].stats.life.value > 0) {
            applyGravity(players[i]);
            playerInputs[i][0](i, playerInputs[i][1]);
            updatePlayer(players[i]);
            players[i].stats.life.value += players[i].stats.life.value + 0.01;
            if (players[i].stats.life.value > players[i].stats.life.valueMax) {
                players[i].stats.life.value = players[i].stats.life.valueMax;
            }
            let minDistance = 9999999;
            let closest = null;
            for (let j = 0; j < players.length; j++) {
                if (i === j) {
                    continue;
                }
                let distance = pointDistance(players[i].x, players[i].y, players[j].x, players[j].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = players[j];
                }
            }
            for (let j = 0; j < cpus.length; j++) {
                let distance = pointDistance(players[i].x, players[i].y, cpus[j].x, cpus[j].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = cpus[j];
                }
            }
            let pointer = players[i].node.elements[i].children[1].children[0];
            if (closest !== null) {
                let direction = pointDirection(players[i].x, players[i].y, closest.x, closest.y);
                minDistance /= 20;
                if (minDistance < 70) {
                    minDistance = 70;
                } else if (minDistance > 200) {
                    minDistance = 200;
                }
                pointer.transform.baseVal[0].matrix.e = lengthDirX(minDistance, direction - 90);
                pointer.transform.baseVal[0].matrix.f = lengthDirY(minDistance, direction - 90);
                pointer.children[0].transform.baseVal[0].setRotate(direction - 90, 0, 0);
                pointer.style.display = '';
            } else {
                pointer.style.display = 'none';
            }
        } else {
            createExplosion(players[i].x, players[i].y, players[i].explosionSound);
            destroy(players, i);
        }
    }
    for (let i = 0; i < cpus.length; i++) {
        checkCollisions(cpus[i], planets);
        if (cpus[i].stats.life.value > 0) {
            applyGravity(cpus[i]);
            ai(cpus[i]);
            updatePlayer(cpus[i]);
        } else {
            createExplosion(cpus[i].x, cpus[i].y, cpus[i].explosionSound);
            destroy(cpus, i);
        }
    }


    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].delay !== null && glitches[i].delay-- < 0) {
            // Emit glitch particles
            let glitch = glitches[i].glitchLog[0];
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: glitch[0] + lengthDirX((Math.random() * 50) - 25, glitch[2]),
                    y: glitch[1] + lengthDirY((Math.random() * 50) - 25, glitch[2]),
                    node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                        element.children[0].style.fill = ['#9417FF', '#5A30CC', '#9417FF', '#fff'][Math.floor(Math.random() * 4)];
                        element.children[0].style.opacity = Math.random();
                        element.children[0].transform.baseVal[0].setRotate(glitch[2], 0, 0);
                        element.children[0].transform.baseVal[1].setScale(1, 1);
                    }),
                    life: 100,
                    speed: Math.random() * 2,
                    direction: i % 2 == 0 ? glitch[2] + 90 : glitch[2] - 90,
                    animate: (particle, element) => {
                        element.children[0].transform.baseVal[1].setScale(1 / 50 * particle.life, 1 / 50 * particle.life);
                        element.children[0].style.opacity = 1 / 50 * particle.life;
                    },
                });
            }
            
            glitches[i].delay = null;
            for (let n = 0; n < glitches[i].node.elements.length; n++) {
                glitches[i].node.elements[n].style.display = '';
            }
        }
        
        if (glitches[i].delay === null) {
            let glitch = glitches[i].glitchLog.shift();
            move(glitches[i].node, glitch[0], glitch[1]);
            rotate(glitches[i].node, glitch[2], glitches[i].rotationPointX, glitches[i].rotationPointY);
            if (glitch[3] > 0.1) {
                emit(glitch[0], glitch[1], 25, glitch[2]);
            }
            
            if (glitch[4]) {
                playSound(glitches[i].owner.shootSound, glitch[0], glitch[1]);
                bullets.push({
                    owner: glitches[i].owner,
                    node: nodeCreate('bullet', '.bottomLayer'),
                    rotationPointX: 0,
                    rotationPointY: 0,
                    x: glitch[0] + lengthDirX(glitches[i].owner.gunMounts[glitch[5]], glitch[2] + 90),
                    y: glitch[1] + lengthDirY(glitches[i].owner.gunMounts[glitch[5]], glitch[2] + 90),
                    direction: glitch[2],
                    speed: 30,
                    life: 60,
                    mass: 0.8,
                    collisionRadius: 10,
                    damage: 1,
                });
            }
            
            if (!glitches[i].glitchLog.length) {
                // Emit glitch particles
                for (let i = 0; i < 30; i++) {
                    particles.push({
                        x: glitch[0] + lengthDirX((Math.random() * 50) - 25, glitch[2]),
                        y: glitch[1] + lengthDirY((Math.random() * 50) - 25, glitch[2]),
                        node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                            element.children[0].style.fill = ['#9417FF', '#5A30CC', '#9417FF', '#fff'][Math.floor(Math.random() * 4)];
                            element.children[0].style.opacity = Math.random();
                            element.children[0].transform.baseVal[0].setRotate(glitch[2], 0, 0);
                            element.children[0].transform.baseVal[1].setScale(1, 1);
                        }),
                        life: 100,
                        speed: Math.random() * 2,
                        direction: i % 2 == 0 ? glitch[2] + 90 : glitch[2] - 90,
                        animate: (particle, element) => {
                            element.children[0].transform.baseVal[1].setScale(1 / 50 * particle.life, 1 / 50 * particle.life);
                            element.children[0].style.opacity = 1 / 50 * particle.life;
                        },
                    });
                }
                destroy(glitches, i);
            }
        }
    }

    moveGameObjects2(players);
    moveGameObjects2(cpus);
    moveGameObjects(bullets);
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
        applyGravity(bullets[i]);

        // Collide with ships
        checkCollisions(bullets[i], players);
        checkCollisions(bullets[i], cpus);
        checkCollisions(bullets[i], planets);
        if (bullets[i].life <= 0) {
            bullets[i].explode = true;
        }

        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            if (bullets[i].explode) {
                createExplosion(bullets[i].x, bullets[i].y, bullets[i].owner.explosionSound);
            }
            destroy(bullets, i);
        }
    }

    for (let i = 0; i < particles.length; i++) {
        particles[i].x += lengthDirX(particles[i].speed, particles[i].direction);
        particles[i].y += lengthDirY(particles[i].speed, particles[i].direction);
        for (let j = 0; j < particles[i].node.elements.length; j++) {
            particles[i].animate(particles[i], particles[i].node.elements[j]);
        }

        move(particles[i].node, particles[i].x, particles[i].y);
        particles[i].life--;
        if (particles[i].life < 0) {
            destroy(particles, i);
        }
    }


    for (let p = 0; p < panes.length; p++) {
        if (players[p]) {
            panes[p].viewBox.baseVal.x = players[p].x - (window.innerWidth * zoom) / 2;
            panes[p].viewBox.baseVal.y = players[p].y - (window.innerHeight * zoom) / 2;
            panes[p].viewBox.baseVal.width = window.innerWidth * zoom;
            panes[p].viewBox.baseVal.height = window.innerHeight * zoom;
        }
    }

    if (playerInputs.length === 1 && players[0]) {
        while (cpus.length < cpuCount(players[0].points)) {
            createCpu({
                stats: {
                    life: {
                        value: 1,
                        valueMax: 1,
                    }
                }
            });
        }
    }


    if (!players.length) {
        stateDeadInit();
    }
}
