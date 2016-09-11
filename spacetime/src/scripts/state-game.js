stateGameInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'none';
    state = stateGame;
    
    createSolarSystem(solarSystemData);
    
    createPlayer();
    //createPlayer();
    createCpu();
    createCpu();
    createCpu();
    
    main(true);
}

stateGame = () => {
    // Move planets
    for (let i = 0; i < planets.length; i++) {
        planets[i].angle += planets[i].orbitSpeed;
        planets[i].x = lengthDirX(planets[i].distance, planets[i].angle);
        planets[i].y = lengthDirY(planets[i].distance, planets[i].angle);
        move(planets[i].translate, planets[i].x, planets[i].y);
        planets[i].translate.children[planets[i].translate.children.length - 1].transform.baseVal[0].setRotate(pointDirection(0, 0, planets[i].x, planets[i].y), 0, 0);
    }

    for (let i = 0; i < players.length; i++) {
        checkCollisions(players[i], planets);
        if (players[i].life > 0) {
            applyGravity(players[i]);
            controlUpdate(i);
            updatePlayer(players[i]);
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
            move(glitches[i].translate, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]);
            rotate(glitches[i].rotate, glitches[i].glitchLog[0][2], 16, 4);
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
        
        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            createExplosion(bullets[i].x, bullets[i].y, bullets[i].owner.explosionSound);
            destroy(bullets, i);
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
            destroy(particles, i);
        }
    }
    
    if (players[0]) {
        svgNode.viewBox.baseVal.x = players[0].x - (window.innerWidth * zoom) / 2;
        svgNode.viewBox.baseVal.y = players[0].y - (window.innerHeight * zoom) / 2;
        svgNode.viewBox.baseVal.width = window.innerWidth * zoom;
        svgNode.viewBox.baseVal.height = window.innerHeight * zoom;
    }
    
    if (!players.length) {
        stateDeadInit();
    }
}
