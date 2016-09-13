stateGameInit = () => {
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
        if (players[i].life > 0) {
            applyGravity(players[i]);
            playerInputs[i][0](i, playerInputs[i][1]);
            updatePlayer(players[i]);
            players[i].life += players[i].life + 0.01;
            if (players[i].life > players[i].lifeMax) {
                players[i].life = players[i].lifeMax;
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
            if (closest !== null) {
                let direction = pointDirection(players[i].x, players[i].y, closest.x, closest.y);
                minDistance /= 20;
                if (minDistance < 70) {
                    minDistance = 70;
                } else if (minDistance > 200) {
                    minDistance = 200;
                }
                let pointer = players[i].node.elements[i].children[1].children[0];
                pointer.transform.baseVal[0].matrix.e = lengthDirX(minDistance, direction - 90);
                pointer.transform.baseVal[0].matrix.f = lengthDirY(minDistance, direction - 90);
                pointer.children[0].transform.baseVal[0].setRotate(direction - 90, 0, 0);
            }
        } else {
            createExplosion(players[i].x, players[i].y, players[i].explosionSound);
            destroy(players, i);
        }
    }
    for (let i = 0; i < cpus.length; i++) {
        checkCollisions(cpus[i], planets);
        if (cpus[i].life > 0) {
            applyGravity(cpus[i]);
            ai(cpus[i]);
            updatePlayer(cpus[i]);
        } else {
            createExplosion(cpus[i].x, cpus[i].y, cpus[i].explosionSound);
            destroy(cpus, i);
        }
    }
    

    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].glitchLog[0]) {
            move(glitches[i].node, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]);
            rotate(glitches[i].node, glitches[i].glitchLog[0][2], 16, 4);
        }
        if (!glitches[i].glitchLog.shift()) {
            destroy(glitches, i);
        }
    }

    moveGameObjects2(players);
    moveGameObjects2(cpus);
    moveGameObjects(bullets);
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
//        emit(bullets[i].emitter, bullets[i].x, bullets[i].y, bullets[i].speed, bullets[i].direction);
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
        particles[i].animate(particles[i]);

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
                lifeMax: 1,
            });
        }
    }


    if (!players.length) {
        stateDeadInit();
    }
}
