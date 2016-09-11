//debug
updatedPerSecond = 0;
updatedPerSecondTimer = performance.now();
///debug

zoom = 2;

gravityPower = 25000;
cpus = [];
glitches = [];
players = [];
planets = [];
bullets = [];
particles = [];

createSolarSystem = (data) => {
    // Append Planets
    data.planets.forEach((asset, i) => {
        let planetClone = asset.cloneNode(true);
        planetClone.id = '';
        let planet = {
            translate: planetClone,
            distance: 1000 * i,
            angle: Math.random() * 360,
            scale: i > 0 ? Math.random() + 0.5 : 3,
            orbitSpeed: 0.1 - (1 / 100000 * (300 * i)),
        };
        planet.collisionRadius = 100 * planet.scale;
        planet.mass = planet.scale;
        planets.push(planet);
        planetClone.transform.baseVal[1].setScale(planet.scale, planet.scale); 
        planetLayer.appendChild(planetClone);
    });
};

solarSystemData = {
    planets: [
        sunStar,
        planetOrange,
        planetBlue,
        planetGrey,
        planetOrange,
        planetBlue,
        planetGrey,
    ],
    stars: {
        count: 10000,
        field: {
            width: window.innerWidth * 15,
            height: window.innerHeight * 15,
        },
    }
};

// Append stars
for (let i = 0; i < solarSystemData.stars.count; i++) {
    let star = starNode.cloneNode(true);
    star.id = '';

    star.r.baseVal.value = Math.random() * 5;
    star.cx.baseVal.value = solarSystemData.stars.field.width * 2 * Math.random() - solarSystemData.stars.field.width;
    star.cy.baseVal.value = solarSystemData.stars.field.height * 2 * Math.random() - solarSystemData.stars.field.height;
    star.style.opacity = Math.random();

    star.style.fill = '#c0f7ff';
    if (Math.random() <= 0.5){
        star.style.fill = '#fff';
    } else if (Math.random() <= 0.5){
        star.style.fill = '#fffec4';
    }

    stars.appendChild(star);
}

createPlayer = () => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    playerNode.setAttribute('class', 'player1');
    topLayer.appendChild(playerNode);
    players.push({
        id: Math.floor(Math.random() * 1000000),
        translate: playerNode,
        rotate: playerNode.children[0],
        rotationPointX: 67/2,
        rotationPointY: 53/2,
        
        life: 10,
        
        shootSound: soundGenerator.generateLaserShoot(),
        explosionSound: soundGenerator.generateExplosion(),

        x: Math.random() * 5000 - 2500,
        y: Math.random() * 5000 - 2500,
        direction: 0,
        facing: 0,
        speed: 0,

        mass: 1,
        collisionRadius: 30,

        maxSpeed: 15,
        acceleration: 0.4,
        friction: 1.1,

        turnSpeed: 0,
        maxTurnSpeed: 5,
        turnAcceleration: 0.5,
        turnFriction: 1.2,
        currentAcceleration: 0,

        shoot: false,
        reloading: 0,
        reloadTime: 10,
        gunMount: 0,
        gunMounts: [20, -20],
        
        glitch: 0,
        glitchTime: 30,
        glitchLog: [],
        
        emitter: {
            particle: bubbleParticle,
            reloading: 0,
            reloadTime: 1,
            amount: 1,
        },
    });
};

createCpu = () => {
    createPlayer();
    cpuPlayer = players.pop();
    cpuPlayer.translate.setAttribute('class', 'player2');
    cpus.push(cpuPlayer);
};

bubbleParticleAnimation = (particle) => {
    particle.translate.style.opacity -= 0.01;
};

updatePlayer = (player) => {
    player.facing += player.turnSpeed;

    while (player.facing > 360) {
        player.facing -= 360;
    }
    while (player.facing < 0) {
        player.facing += 360;
    }

    player.emitter.reloading--;
    if (player.currentAcceleration > 0.1) {
        emit(player.emitter, player.x, player.y, 25, player.facing);
    }
    
    player.reloading--;
    if (player.shoot && player.reloading < 0) {
        playSound(player.shootSound, player.x, player.y);
        
        player.reloading = player.reloadTime;

        bulletClone = bullet.cloneNode(true);
        bulletClone.id = '';
        bottomLayer.appendChild(bulletClone);
        bullets.push({
            owner: player,
            translate: bulletClone,
            rotate: bulletClone,
            rotationPointX: 0,
            rotationPointY: 0,
            x: player.x + lengthDirX(player.gunMounts[player.gunMount], player.facing + 90),
            y: player.y + lengthDirY(player.gunMounts[player.gunMount], player.facing + 90),
            direction: player.facing,
            speed: 30,
            life: 200,
            mass: 0.8,
            collisionRadius: 10,
            damage: 1,
            emitter: {
                particle: bubbleParticle,
                reloading: 0,
                reloadTime: 1,
                amount: 1,
            },
        });
        
        player.gunMount++;
        if (player.gunMount >= player.gunMounts.length) {
            player.gunMount = 0;
        }
    }
    player.shoot = false;
};

main = (init) => {
    //debug
    updatedPerSecond++;
    if (updatedPerSecondTimer < performance.now()) {
        ups.innerHTML = 'UPS: ' + updatedPerSecond;
        updatedPerSecondTimer = performance.now() + 1000;
        updatedPerSecond = 0;
    }
    if (players[0] && cpus[0]) {
        pos.innerHTML = `
            POS: ${parseInt(players[0].x)}, ${parseInt(players[0].y)} 
            SPEED: ${parseInt(players[0].speed)} 
            DIR: ${parseInt(players[0].direction)} 
            FACE: ${parseInt(players[0].facing)}
            ACEL: ${players[0].currentAcceleration.toFixed(3)}
            <br/>
            POS: ${parseInt(cpus[0].x)}, ${parseInt(cpus[0].y)} 
            SPEED: ${parseInt(cpus[0].speed)} 
            DIR: ${parseInt(cpus[0].direction)} 
            FACE: ${parseInt(cpus[0].facing)}
            ACEL: ${cpus[0].currentAcceleration.toFixed(3)}
        `;
    }
    ///debug

    state();

    if (init !== true) {
        requestAnimationFrame(main);
    }
};

stateStartInit();
main();
