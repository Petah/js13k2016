//debug
updatedPerSecond = 0;
updatedPerSecondTimer = performance.now();
///debug

split = location.search.indexOf('split') !== -1;
low = location.search.indexOf('low') !== -1;
zoom = 2;
gravityPower = 2500;
cpus = [];
glitches = [];
players = [];
planets = [];
bullets = [];
particles = [];
quality = low ? 0.1 : 1;
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
playerInputs = [];

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

        lifeMax: 20,
        lifeRegenRate: 5,
        lifeRegenTime: 0,

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

        glitch: 0,
        glitchMax: 20,
        glitchLog: [],
        glitchTime: 30,
        glitchReload: 30,

        emitter: {
            particle: bubbleParticle,
            reloading: 0,
            reloadTime: 1,
            amount: 1,
        },
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
    
    player.glitchReload--;
    if (player.glitch && player.glitchReload < 0) {
        player.glitchReload = player.glitchTime;
        player.x += Math.random() * 2000 - 1000;
        player.y += Math.random() * 2000 - 1000;
        glitches.push({
            node: nodeCreate('boatWrapper', '.topLayer'),
            glitchLog: player.glitchLog,
        });
        player.glitchLog = [];
    }
    player.glitch = false;
    
    player.glitchLog.push([player.x, player.y, player.facing]);
    
    player.reloading--;
    if (player.shoot && player.reloading < 0) {
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
//            move(base, baseW, 0);
//            move(h.children[0].children[1], baseW - 112, 76);
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
        player.hud[data[j].id] = hudLayer.children[hudLayer.children.length - 1];
    }
};

updateHud = (player, id) => {
    if (player[id] >= 0 && player[id] <= player.lifeMax && player.hud.hasOwnProperty(id)) {
        let bClass = 'hudBar';
        for (let i = 0; i < player.hud[id].children[1].children.length; i++) {
            if (i >= player[id]) bClass += ' hudBarE';
            player.hud[id].children[1].children[i].setAttributeNS(null, 'class', bClass);
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
