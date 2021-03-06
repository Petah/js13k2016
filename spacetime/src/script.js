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
glitchColors = {
    human: ['#9417FF', '#5A30CC', '#9417FF', '#fff'],
    cpu: ['#e0421d', '#ed4559', '#e0421d', '#fff']
};

setGameState = (s, l) => {
    split = s;
    low = l;
    location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high');
};

updateLinkClass = (c, a) => {
    els = document.getElementsByClassName(c);
    for (var i = 0; i < els.length; i++) {
        els[i].className += a;
    }
};

updateButtons = () => {
    c = location.search.substr(1).split(',');
    for(var i = 0; i < c.length; ++i) {
        updateLinkClass(c[i], ' active');
    }
};

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
        x += Math.random() * 10000 - 5000;
        y += Math.random() * 10000 - 5000;
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
        
        hud: {},
        
        life: split ? 10 : 20,
        lifeMax: split ? 10 : 20,
        
        glitch: false,
        glitchCharge: 0,
        glitchMax: 20,
        glitchLog: [],
        glitchReloadTime: 30,
        glitchReloading: 30,
        glitching: false,

        shootSound: createSound(soundGenerator.generateLaserShoot()),
        glitchSound: createSound(soundGenerator.generateJump()),
        explosionSound: createSound(soundGenerator.generateHitHurt()),

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

    player.life = player.lifeMax;
    players.push(player);
};

createCpu = (options) => {
    createPlayer(options);
    cpuPlayer = players.pop();
    cpuPlayer.type = 'cpu';
    cpuPlayer.node.elements[0].classList = 'player2';
    cpus.push(cpuPlayer);
};

spawnPlayer = (player) => {
    let x = 0, y = 0, minDistance;
    do {
        minDistance = 9999999;
        x += Math.random() * 200 - 100;
        y += Math.random() * 200 - 100;
        for (let i = 0; i < planets.length; i++) {
            let distance = Math.abs(pointDistance(x, y, lengthDirX(planets[i].distance, planets[i].angle), lengthDirY(planets[i].distance, planets[i].angle)));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
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
    } while (minDistance < 700);
    player.x = x;
    player.y = y;
};

updatePlayer = (player) => {
    player.facing += player.turnSpeed;

    while (player.facing > 360) {
        player.facing -= 360;
    }
    while (player.facing < 0) {
        player.facing += 360;
    }

    if (player.currentAcceleration > 0.1 && !player.glitching) {
        emit(player.x, player.y, 25, player.facing);
    }
    
    if (player.glitch && player.glitchReloading < 0 && player.glitchCharge >= player.glitchMax) {
        // Emit glitch particles
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: player.x + lengthDirX((Math.random() * 50) - 25, player.facing),
                y: player.y + lengthDirY((Math.random() * 50) - 25, player.facing),
                node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                    element.children[0].style.fill = glitchColors[player.type][Math.floor(Math.random() * 4)];
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
        playSound(player.glitchSound, player.x, player.y);
        player.glitchCharge = 0;
        player.glitching = true;
        player.glitchReloading = player.glitchReloadTime;
        for (let e = 0; e < player.node.elements.length; e++) {
            player.node.elements[e].style.display = 'none';
        }
        player.speed = 0;
    }
    
    if (player.glitching && player.glitchReloading  < 0) {
        player.glitching = false;
        for (let e = 0; e < player.node.elements.length; e++) {
            player.node.elements[e].style.display = '';
        }
        glitches.push({
            owner: player,
            node: nodeCreate('boatWrapper', '.topLayer', (element) => {
                element.style.display = 'none';
                element.children[1].children[0].style.display = 'none';
                if (player.type === 'cpu') {
                    element.classList = 'player2';
                }
            }),
            rotationPointX: 67/2,
            rotationPointY: 53/2,
            delay: Math.random() * 100,
            glitchLog: player.glitchLog,
        });
        
        player.glitchLog = [];
        spawnPlayer(player);
    }
    
    if (!player.glitching) {
        player.glitchLog.push([player.x, player.y, player.facing, player.currentAcceleration, player.shoot && player.reloading < 0 && !player.glitching, player.gunMount]);
    }
    
    if (player.shoot && player.reloading < 0 && !player.glitching) {
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
    
    player.glitchReloading--;
    player.glitch = false;
    player.reloading--;
    player.shoot = false;
};

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
            let baseW = 436; // Magic
            base.transform.baseVal[1].setScale(-1, 1);
            move({elements:[base]}, baseW, 0);
            move({elements:[h.children[0].children[1]]}, baseW - 112, 76);
        }

        // Append bars
        let bars = h.children[1];
        h.children[0].children[1].innerHTML = data[j].text;
        for (let i = 0; i < player.lifeMax; i++) {
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

updateHud = (player, current, max, stat) => {
    if (current >= 0 && current <= max) {
        let bClass = 'hudBar';
        for (let i = 0; i < player.hud[stat].element.children[1].children.length; i++) {
            if (i >= current) {
                bClass += ' hudBarE';
            }
            let index = (player.hud[stat].data.hAlign === 'right') ? (player.hud[stat].element.children[1].children.length - (i + 1)) : i;
            player.hud[stat].element.children[1].children[index].classList = bClass;
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

main = (time, init) => {
    state();

    if (init !== true) {
        requestAnimationFrame(main);
    }
};

stateStartInit();
updateButtons();
main();

//setInterval(() => {
//    state();
//}, 1000 / 60);
