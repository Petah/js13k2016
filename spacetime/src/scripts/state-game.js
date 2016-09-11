stateGame = () => {
    // rotate sun
    solarSystemData.members.sun.rotateAngle += 0.02;
    rotate(solarSystemData.members.sun.asset, solarSystemData.members.sun.rotateAngle, solarSystemData.origin.x, solarSystemData.origin.y);

    // move planets
    for (let i = 0; i < planets.length; i++) {
        planets[i].angle += planets[i].orbitSpeed;
        planets[i].x = lengthDirX(planets[i].distance, planets[i].angle);
        planets[i].y = lengthDirY(planets[i].distance, planets[i].angle);
        move(planets[i].element, planets[i].x, planets[i].y);
		// planets[i].element.children[0].transform.baseVal[0].setRotate(pointDirection(0, 0, planets[i].x, planets[i].y), 0, 0);
        planets[i].element.children[planets[i].element.children.length - 1].transform.baseVal[0].setRotate(pointDirection(0, 0, planets[i].x, planets[i].y), 0, 0);
    }

    for (let i = 0; i < players.length; i++) {
        if (players[i].health > 0) {
            controlUpdate(i);
            updatePlayer(players[i]);
        } else {
            players[i].speed = 0;
        }
    }
    for (let i = 0; i < cpus.length; i++) {
        if (cpus[i].health > 0) {
            ai(cpus[i]);
            updatePlayer(cpus[i]);
        } else {
            cpus[i].speed = 0;
        }
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
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
        emit(bullets[i].emitter, bullets[i].x, bullets[i].y, bullets[i].speed, bullets[i].direction);
    
        for (let j = 0; j < planets.length; j++) {
            let planetDistance = pointDistance(bullets[i].x, bullets[i].y, planets[j].x, planets[j].y);
            if (planetDistance < 100 * planets[j].scale) {
                bullets[i].life = 0;
            }
            let planetDirection = pointDirection(bullets[i].x, bullets[i].y, planets[j].x, planets[j].y);
            let newPlanetMotion = motionAdd(bullets[i].speed, bullets[i].direction, 1 / bullets[i].mass * gravityPower * (bullets[i].mass * planetMass) / (planetDistance * planetDistance), planetDirection);
            bullets[i].speed = newPlanetMotion[0];
            bullets[i].direction = newPlanetMotion[1];
        }

        // Collide with ships
        col(bullets[i], players);
        col(bullets[i], cpus);
        
        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            createExplosion(bullets[i].x, bullets[i].y, bullets[i].owner.explosionSound);

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
}
