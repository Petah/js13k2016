//debug
updatedPerSecond = 0;
updatedPerSecondTimer = performance.now();
///debug

bullets = [];
cpus = [];
glitches = [];
gravityPower = 2500;
low = location.search.indexOf('low') !== -1;
planets = [];
players = [];
playerInputs = [];
particles = [];
quality = low ? 0.1 : 1;
split = location.search.indexOf('split') !== -1;
timeElapsed = 0;
timeElapsedID = false;
zoom = 2;

updateTimeElapsed = () => {
    timeElapsedID = setInterval(() => {
        elapsedTime.innerText = ++timeElapsed;
    }, 1000);
};

if (split) {
    panes = [
        document.querySelector('.splitLeft'),
        document.querySelector('.splitRight'),
    ];
} else {
    panes = [
        document.querySelector('.splitLeft'),
    ];
    panes[0].style.width = '100vw';
}

createNodes = (nodeArray, node, layer) => {
    for (let p = 0; p < panes.length; p++) {
        for (let p = 0; p < panes.length; p++) {
            while (nodeArray.length < 1000) {
                let nodeClone = node.cloneNode(true);
                nodeClone.id = '';
                panes[p].querySelector(layer).appendChild(nodeClone);
                nodeArray.push(nodeClone);
            }
        }
    }
};

//nodeExplosions = [];
//createNodes(nodeExplosions, explosion, '.topLayer');
//nodeBullets = [];
//createNodes(nodeBullets, bullet, '.bottomLayer');
//nodeBubbles = [];
//createNodes(nodeBubbles, bubbleParticle, '.bottomLayer');

createSolarSystem = () => {
    let planetNodes = [
        'sunStar',
        'planetOrange',
        'planetBlue',
        'planetGrey',
        'planetOrange',
        'planetBlue',
        'planetGrey',
    ];
    for (let i = 0; i < planetNodes.length; i++) {
        let scale = i > 0 ? Math.random() + 0.5 : 3;
        let planet = {
            node: nodeCreate(planetNodes[i], '.planetLayer', (element) => {
                element.transform.baseVal[1].setScale(scale, scale);
            }),
            distance: 1000 * i,
            angle: Math.random() * 360,
            scale: scale,
            mass: scale * 10,
            collisionRadius: scale * 100,
            orbitSpeed: 0.1 - (1 / 100000 * (300 * i)),
        };
        planets.push(planet);
    }
};

solarSystemData = {
    stars: {
        count: 2000 * quality,
        field: {
            width: window.innerWidth * 15,
            height: window.innerHeight * 15,
        },
    }
};

// Append stars
for (let p = 0; p < panes.length; p++) {
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

        panes[p].querySelector('.stars').appendChild(star);
    }
}

createPlayer = (options) => {
    let x = 0, y = 0, minDistance;
    do {
        minDistance = 9999999;
        x += Math.random() * 5000 - 2500;
        y += Math.random() * 5000 - 2500;
        for (let i = 0; i < planets.length; i++) {
            let distance = Math.abs(pointDistance(x, y, lengthDirX(planets[i].distance, planets[i].angle), lengthDirY(planets[i].distance, planets[i].angle)));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    } while (minDistance < 1000);
    let player = {
        id: Math.floor(Math.random() * 1000000),
        type: 'human',
        node: nodeCreate('boatWrapper', '.topLayer', (element, i) => {
            if (i !== players.length) {
                element.children[1].style.display = 'none';
            }
        }),
        rotationPointX: 67/2,
        rotationPointY: 53/2,

        stats: {
            glitch: {
            	glitching: false,
                log: [],
                hud: 'glitch',
                regenRate: 3,
                regenTime: 0,
                reload: 30,
                time: 50,
                value: 0,
                valueMax: 20,
            },
            life: {
                hud: 'life',
                regenRate: 5,
                regenTime: 0,
                value: 20,
                valueMax: 20,
            }
        },

        hud: {},

        shootSound: createSound(soundGenerator.generateLaserShoot()),
        explosionSound: createSound(soundGenerator.generateExplosion()),

        x: x,
        y: y,
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

        points: 0,
    };

    for (let key in options) {
        player[key] = options[key];
    }

    player.stats.life.value = player.stats.life.valueMax;
    players.push(player);
};

createCpu = (options) => {
    createPlayer(options);
    cpuPlayer = players.pop();
    cpuPlayer.type = 'cpu';
    cpuPlayer.node.elements[0].classList = 'player2';
    cpus.push(cpuPlayer);
};

updatePlayer = (player) => {
    player.facing += player.turnSpeed;

    while (player.facing > 360) {
        player.facing -= 360;
    }
    while (player.facing < 0) {
        player.facing += 360;
    }

    if (player.type === 'human') {
        if (player.currentAcceleration > 0.1 && !player.glitching) {
            emit(player.x, player.y, 25, player.facing);
        }

        if (player.glitch && player.glitchReload < 0) {
            // Emit glitch particles
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: player.x + lengthDirX((Math.random() * 50) - 25, player.facing),
                    y: player.y + lengthDirY((Math.random() * 50) - 25, player.facing),
                    node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                        element.children[0].style.fill = ['#9417FF', '#5A30CC', '#9417FF', '#fff'][Math.floor(Math.random() * 4)];
                        element.children[0].style.opacity = Math.random();
                        element.children[0].transform.baseVal[0].setRotate(player.facing, 0, 0);
                        element.children[0].transform.baseVal[1].setScale(1, 1);
                    }),
                    life: 100,
                    speed: Math.random() * 2,
                    direction: i % 2 == 0 ? player.facing + 90 : player.facing - 90,
                    animate: (particle, element) => {
                    element.children[0].transform.baseVal[1].setScale(1 / 50 * particle.life, 1 / 50 * particle.life);
                    element.children[0].style.opacity = 1 / 50 * particle.life;
                },
            });
            }

            // Glitch player
            player.stats.glitch.glitching = true;
            player.stats.glitch.reload = player.stats.glitch.time;
            for (let e = 0; e < player.node.elements.length; e++) {
                player.node.elements[e].style.display = 'none';
            }
            player.speed = 0;
        }

        if (player.stats.glitch.glitching && player.stats.glitch.reload < 0) {
            player.stats.glitch.glitching = false;
            for (let e = 0; e < player.node.elements.length; e++) {
                player.node.elements[e].style.display = '';
            }
            glitches.push({
                owner: player,
                node: nodeCreate('boatWrapper', '.topLayer', (element) => {
                    element.style.display = 'none';
                    element.children[1].children[0].style.display = 'none';
                }),
                rotationPointX: 67 / 2,
                rotationPointY: 53 / 2,
                delay: Math.random() * 100,
                glitchLog: player.stats.glitch.log,
            });

            player.stats.glitch.log = [];
            let x = 0, y = 0, minDistance;
            do {
                minDistance = 9999999;
                x += Math.random() * 200 - 100;
                y += Math.random() * 200 - 100;
                for (let i = 0; i < players.length; i++) {
                    let distance = Math.abs(pointDistance(x, y, players[i].x, players[i].y));
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                for (let i = 0; i < cpus.length; i++) {
                    let distance = Math.abs(pointDistance(x, y, cpus[i].x, cpus[i].y));
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                for (let i = 0; i < glitches.length; i++) {
                    let distance = Math.abs(pointDistance(x, y, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]));
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
            } while (minDistance < 500);
            player.x = x;
            player.y = y;
        }

        if (!player.stats.glitch.glitching) {
            player.stats.glitch.log.push([
                player.x,
                player.y,
                player.facing,
                player.currentAcceleration,
                player.shoot && player.reloading < 0 && !player.stats.glitch.glitching,
                player.gunMount
            ]);
        }

        if (player.shoot && player.reloading < 0 && !player.stats.glitch.glitching) {
            playSound(player.shootSound, player.x, player.y);
            player.reloading = player.reloadTime;
            bullets.push({
                owner: player,
                node: nodeCreate('bullet', '.bottomLayer'),
                rotationPointX: 0,
                rotationPointY: 0,
                x: player.x + lengthDirX(player.gunMounts[player.gunMount], player.facing + 90),
                y: player.y + lengthDirY(player.gunMounts[player.gunMount], player.facing + 90),
                direction: player.facing,
                speed: 30,
                life: 60,
                mass: 0.8,
                collisionRadius: 10,
                damage: 1,
            });

            player.gunMount++;
            if (player.gunMount >= player.gunMounts.length) {
                player.gunMount = 0;
            }
        }

        player.stats.glitch.reload--;
        player.stats.glitch.value = false;
        player.reloading--;
        player.shoot = false;
    }
};

regenerateStat = (player, stat) => {
    if (player.stats[stat].value < player.stats[stat].valueMax) {
        if (player.stats[stat].regenTime === 0) {
            player.stats[stat].regenTime = Date.now();
            return;
        }
        if ((Date.now() - player.stats[stat].regenTime) > (player.stats[stat].regenRate * 1000)) {
            ++player.stats[stat].value;
            player.stats[stat].regenTime = Date.now();
            updateHud(player, stat);
        }
    }
}

// HUD
createHud = (data, player) => {
    for (let j = 0; j < data.length; j++) {
        let h = hud.cloneNode(true);
        h.id = 'hud' + data[j].id.charAt(0).toUpperCase() + data[j].id.substr(1).toLowerCase();

        // Scale to suit viewport
        hScale = (window.innerWidth / 900 * 0.1) + 0.5;
        h.transform.baseVal[1].setScale(hScale, hScale);

        // Flip base if aligning right
        if (data[j].hasOwnProperty('hAlign') && data[j].hAlign === 'right') {
            h.setAttributeNS(null, 'class', 'hudRight');
            let base = h.children[0].children[0];
            console.log(base);
            let baseW = 436; // Magic
            base.transform.baseVal[1].setScale(-1, 1);
            move({elements:[base]}, baseW, 0);
            move({elements:[h.children[0].children[1]]}, baseW - 112, 76);
        }

        // Append bars
        let bars = h.children[1];
        h.children[0].children[1].innerHTML = data[j].text;
        for (let i = 0; i < player.stats.life.valueMax; i++) {
            let bar = i == 0 ? bars.children[0] : bars.children[0].cloneNode(true);
            bar.setAttributeNS(null, 'x', i * data[j].bars.offset);
            if (i >= player[data[j].id]) {
                bar.setAttributeNS(null, 'class', 'hudBar hudBarE');
            }
            bars.appendChild(bar);
        }

        h.style.display = '';
        hudLayer.appendChild(h);
        player.hud[data[j].id] = {
            data: data[j],
            element: hudLayer.children[hudLayer.children.length - 1],
        };
    }
};

updateHud = (player, stat) => {
    if (player.stats[stat].value >= 0 && player.stats[stat].value <= player.stats[stat].valueMax && player.hud.hasOwnProperty(stat)) {
        let bClass = 'hudBar';
        for (let i = 0; i < player.hud[stat].element.children[1].children.length; i++) {
            if (i >= player.stats[stat].value) bClass += ' hudBarE';
            let index = (player.hud[stat].data.hAlign === 'right') ? (player.hud[stat].element.children[1].children.length - (i + 1)) : i;
            player.hud[stat].element.children[1].children[index].setAttributeNS(null, 'class', bClass);
        }
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
        id: 'life',
        bars: {
            width: 16,
            offset: 22,
        },
        text: 'HEALTH',
    },
];

main = (init) => {
    //debug
//    updatedPerSecond++;
//    if (updatedPerSecondTimer < performance.now()) {
//        ups.innerHTML = 'UPS: ' + updatedPerSecond;
//        updatedPerSecondTimer = performance.now() + 1000;
//        updatedPerSecond = 0;
//    }
//    pos.innerHTML = '';
//    if (players[0]) {
//        pos.innerHTML = `
//            POS: ${parseInt(players[0].x)}, ${parseInt(players[0].y)} 
//            SPEED: ${parseInt(players[0].speed)} 
//            DIR: ${parseInt(players[0].direction)} 
//            FACE: ${parseInt(players[0].facing)}
//            ACEL: ${players[0].currentAcceleration.toFixed(3)}
//        `;
//    }
//    if (cpus[0]) {
//        pos.innerHTML += `
//            <br/>
//            POS: ${parseInt(cpus[0].x)}, ${parseInt(cpus[0].y)} 
//            SPEED: ${parseInt(cpus[0].speed)} 
//            DIR: ${parseInt(cpus[0].direction)} 
//            FACE: ${parseInt(cpus[0].facing)}
//            ACEL: ${cpus[0].currentAcceleration.toFixed(3)}
//        `;
//    }
    ///debug

    state();

    if (init !== true) {
        requestAnimationFrame(main);
    }
};

stateStartInit();
main();
