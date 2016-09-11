//debug
updatedPerSecond = 0;
updatedPerSecondTimer = performance.now();
///debug

state = stateGame;

planetMass = 1;
bullets = [];
cpus = [];
glitches = [];
gravityPower = 25000;
particles = [];
planets = [];
players = [];

// SVG Stuff
svgNs = 'http://www.w3.org/2000/svg';

// Solar System
createSolarSystem = (data) => {
    // Append sun
    solarSystemData.members.sun.asset.transform.baseVal[1].setScale(1.5, 1.5);

    // Append Planets
    data.members.planets.forEach((planetDef, i) => {
        let planetClone = planetDef.asset.cloneNode(true);
        planetClone.id = '';
        let planet = {
            element: planetClone,
            distance: data.members.sun.radius * 2 * (i + 1),
            angle: Math.random() * 360,
            scale: Math.random() + 0.2,
            orbitSpeed: 0.4 - (1 / 10000 * (data.members.sun.radius * 2 * (i + 1))),
        };
        planets.push(planet);
        planetClone.transform.baseVal[1].setScale(planet.scale, planet.scale); 
        planetLayer.appendChild(planetClone);
    });

    // Append stars
    for (let i = 0; i < data.stars.count; i++) {
        let star = starNode.cloneNode(true);
        star.id = '';

        star.r.baseVal.value = Math.random() * 5;
        star.cx.baseVal.value = data.stars.field.width * 2 * Math.random() - data.stars.field.width;
        star.cy.baseVal.value = data.stars.field.height * 2 * Math.random() - data.stars.field.height;
        star.style.opacity = Math.random();

        star.style.fill = '#c0f7ff';
        if (Math.random() <= 0.5){
            star.style.fill = '#fff';
        } else if (Math.random() <= 0.5){
            star.style.fill = '#fffec4';
        }

        stars.appendChild(star);
    }
};

solarSystemData = {
    origin: {
        x: 0,
        y: 0
    },
    element: solarSystem,
    members: {
        sun: {
            rotateAngle: 0,
            asset: sunStar,
            radius: 300,
        },
        planets: [
            {
                asset: planetOrange,
            },
            {
                asset: planetBlue,
            },
            {
                asset: planetGrey,
            },
            {
                asset: planetOrange,
            },
            {
                asset: planetBlue,
            },
            {
                asset: planetGrey,
            },
        ],
    },
    stars: {
        count: 10000,
        field: {
            width: window.innerWidth * 15,
            height: window.innerHeight * 15,
        },
    }
};

createPlayer = () => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    playerNode.setAttributeNS(null, 'class', 'player1');
    topLayer.appendChild(playerNode);
    players.push({
        id: Math.floor(Math.random() * 1000000),
        translate: playerNode,
        rotate: playerNode.children[0],
        rotationPointX: 34,
        rotationPointY: 48,
        
        health: 20,
        healthMax: 20,

        hud: {},

        shootSound: soundGenerator.generateLaserShoot(),
        explosionSound: soundGenerator.generateExplosion(),

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
        glitchMax: 20,
        glitchLog: [],
        glitchTime: 30,

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
    cpuPlayer.translate.setAttributeNS(null, 'class', 'player2');
    cpus.push(cpuPlayer);
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

createExplosion = (x, y, sound) => {
    playSound(sound, x, y);
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
    

emit = (emitter, x, y, speed, direction) => {
    emitter.reloading--;
    if (emitter.reloading < 0) {
        emitter.reloading = emitter.reloadTime;

        for (let i = 0; i < emitter.amount; i++) {
            particleClone = emitter.particle.cloneNode(true);
            particleClone.id = '';
            bottomLayer.appendChild(particleClone);
            particles.push({
                x: x + ((Math.random() * 4) - 2),
                y: y + ((Math.random() * 4) - 2),
                translate: particleClone,
                life: 30,
                speed: speed / 10,
                direction: (direction - 180) + ((Math.random() * 30) - 15),
                animate: bubbleParticleAnimation,
            });
        }
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

    player.emitter.reloading--;
    if (player.speed > 0.1) {
        emit(player.emitter, player.x, player.y, player.speed, player.direction);
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
            x: player.x + lengthDirX(player.gunMounts[player.gunMount], player.direction + 90),
            y: player.y + lengthDirY(player.gunMounts[player.gunMount], player.direction + 90),
//            direction: pointDirection(player.x, player.y, mouseX, mouseY),
            direction: player.direction,
            speed: 20,
            life: 200,
            mass: 0.8,
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

col = (bullet, ships) => {
    for (let j = 0; j < ships.length; j++) {
        if (bullet.owner.id == ships[j].id) {
            continue;
        }
        collisionDistance = pointDistance(bullet.x, bullet.y, ships[j].x, ships[j].y);
        if (collisionDistance < 20) {
            bullet.life = 0;
            ships[j].health -= 1;
            updateHud(ships[j], 'health');
            break;
        }
    }
};

// HUD
createHud = (data, player) => {
    for (let j = 0; j < data.length; j++) {
        let h = hud.cloneNode(true);
        h.id = '';
        h.setAttributeNS(null, 'class', 'hud' + data[j].id.charAt(0).toUpperCase() + data[j].id.substr(1).toLowerCase());

        // Scale to suit viewport
        hScale = (window.innerWidth / 900 * 0.1) + 0.5;
        h.transform.baseVal[0].setScale(hScale, hScale);

        // Flip base if aligning right
        if (data[j].hasOwnProperty('hAlign') && data[j].hAlign === 'right') {
            let base = h.children[0].children[0];
            let baseW = 436; // Magic
            base.transform.baseVal[1].setScale(-1, 1);
            move(base, baseW, 0);
            move(h.children[0].children[1], baseW - 112, 76);
            move(h, window.innerWidth - baseW + 106, 0);
        }

        // Append bars
        let bars = h.children[1];
        h.children[0].children[1].innerHTML = data[j].text;
        for (let i = 0; i < player.healthMax; i++) {
            let bar = i == 0 ? bars.children[0] : bars.children[0].cloneNode(true);
            bar.setAttributeNS(null, 'x', i * data[j].bars.offset);
            if (i >= player[data[j].id]) {
                bar.setAttributeNS(null, 'class', 'hudBar hudBarE');
            }
            bars.appendChild(bar);
        }

        hudLayer.appendChild(h);
        player.hud[data[j].id] = hudLayer.children[hudLayer.children.length - 1];
    }
};

updateHud = (player, id) => {
    if (player[id] >= 0 && player.hud.hasOwnProperty(id)) {
        player.hud[id].children[1].children[player[id]].setAttributeNS(null, 'class', 'hudBar hudBarE');
    }
};

hudData = [
    {
        id: 'glitch',
        hAlign: 'right',
        bars: {
            width: 16,
            offset: 22,
        },
        text: 'GLITCH',
    },
    {
        id: 'health',
        bars: {
            width: 16,
            offset: 22,
        },
        text: 'HEALTH',
    },
];

main = () => {
    //debug
    updatedPerSecond++;
    if (updatedPerSecondTimer < performance.now()) {
        ups.innerHTML = 'UPS: ' + updatedPerSecond;
        pos.innerHTML = `POS: ${parseInt(players[0].x)}, ${parseInt(players[0].y)}`;
        updatedPerSecondTimer = performance.now() + 1000;
        updatedPerSecond = 0;
    }
    ///debug

    state();
    
    requestAnimationFrame(main);
};


createPlayer();
//createPlayer();
createCpu();

createSolarSystem(solarSystemData);

createHud(hudData, players[0]);

main();
