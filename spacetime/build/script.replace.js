
m = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

n = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
};

o = (length, d) => {
    return Math.cos(d * Math.PI / 180) * length;
};

p = (length, d) => {
    return Math.sin(d * Math.PI / 180) * length;
};

aq = (polygon) => {
    ar = polygon.getCTM();
    as = [];
    for (let i = 0; i < polygon.points.length; i++) {
        as.push(polygon.points[i].matrixTransform(ar));
    }
    return as;
};

an = (a1, a2, b1, b2) => {
    let result = [];

    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if (u_b != 0) {
        let ua = ua_t / u_b;
        let ub = ub_t / u_b;

        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            console.log(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y));
            result.push([a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)]);
        }
    }

    return result;
};

ao = (a1, a2, points) => {
    let result = [];
    for (let i = 0; i < points.length; i++) {
        result = result.concat(an(a1, a2, points[i], points[(i + 1) % points.length]));
    }
    return result;
};

ap = (points1, points2) => {
    let result = [];
    for (let i = 0; i < points1.length; i++) {
        result = result.concat(ao(points1[i], points1[(i + 1) % points1.length], points2));
    }
    return result;
};


controlUpdate = (playerIndex) => {   
    let gamepads = navigator.getGamepads();
    if (!gamepads[playerIndex]) {
        return;
    }
    if (gamepads[playerIndex].buttons[0].pressed) {
        players[playerIndex].shoot = true;
    }

    players[playerIndex].glitch--;
    if (gamepads[playerIndex].buttons[2].pressed && players[playerIndex].glitch < 0) {
        players[playerIndex].glitch = players[playerIndex].glitchTime;
        players[playerIndex].x += Math.random() * 200 - 100;
        players[playerIndex].y += Math.random() * 200 - 100;
        let playerNode = boatWrapper.cloneNode(true);
        playerNode.id = '';
        topLayer.appendChild(playerNode);
        glitches.push({
            c: playerNode,
            b: playerNode.children[0],
            glitchLog: players[playerIndex].glitchLog,
        });
        players[playerIndex].glitchLog = [];
    }
    players[playerIndex].glitchLog.push([players[playerIndex].x, players[playerIndex].y, players[playerIndex].d]);

    
    if (gamepads[playerIndex].buttons[7].value > 0.2 && players[playerIndex].e < gamepads[playerIndex].buttons[7].value * players[playerIndex].f) {
        players[playerIndex].e = Math.min(players[playerIndex].e + (gamepads[playerIndex].buttons[7].value * players[playerIndex].l), players[playerIndex].f);
    } else {
        players[playerIndex].e /= players[playerIndex].friction;
    }

    if (gamepads[playerIndex].axes[0] > 0.3 || gamepads[playerIndex].axes[0] < -0.3) {
        players[playerIndex].g = Math.round(gamepads[playerIndex].axes[0] * players[playerIndex].h);
    } else {
        players[playerIndex].g /= players[playerIndex].turnFriction;
    }
};



a = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

b = (element, angle, z, aa) => {
    element.transform.baseVal[1].setRotate(angle, z, aa)
};

players = [];
glitches = [];

createPlayer = () => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    topLayer.appendChild(playerNode);
    players.push({
        c: playerNode,
        b: playerNode.children[0],
        z: 16,
        aa: 4,

        x: 500,
        y: 500,
        d: 0,
        e: 0,

        f: 10,
        l: 0.4,
        friction: 1.1,

        g: 0,
        h: 5,
        k: 0.5,
        turnFriction: 1.2,

        shoot: false,
        af: 0,
        ag: 10,
        
        glitch: 0,
        glitchTime: 30,
        glitchLog: [],
    });
};

createPlayer();
createPlayer();

bullets = [];
ac = [];

ad = {
    ae: bubbleParticle,
    af: 0,
    ag: 1,
    ah: 1,
};

bubbleParticleAnimation = (ae) => {
    ae.c.style.opacity -= 0.01;
};

moveGameObjects = (ab) => {
    for (let i = 0; i < ab.length; i++) {
        ab[i].x += o(ab[i].e, ab[i].d);
        ab[i].y += p(ab[i].e, ab[i].d);

        a(ab[i].c, ab[i].x, ab[i].y);
        b(ab[i].b, ab[i].d, ab[i].z, ab[i].aa);
    }
};

createExplosion = (x, y) => {
    for (let i = 0; i < 16; i++) {
        explosionClone = explosion.cloneNode(true);
        explosionClone.id = '';
        explosionClone.style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i / 4)];
        topLayer.appendChild(explosionClone);
        ac.push({
            x: x + ((Math.random() * 10) - 5),
            y: y + ((Math.random() * 10) - 5),
            c: explosionClone,
            life: 5000,
            e: Math.random() / 2,
            d: Math.random() * 360,
            animationState: 0,
            animationSpeed: Math.random() * 2 + 5,
            animate: (ae) => {
                ae.animationState += ae.animationSpeed;
                ae.c.r.baseVal.value = -(Math.cos(ae.animationState * (Math.PI / 100)) - 1) * 5;
                ae.c.style.opacity -= 0.02;
                if (ae.animationState > 200) {
                    ae.life = 0;
                }
            },
        });
    }
};

s = () => {
    
    
    
    for (let i = 0; i < players.length; i++) {
        controlUpdate(i);
        
        players[i].d += players[i].g;

        while (players[i].d > 360) {
            players[i].d -= 360;
        }
        while (players[i].d < 0) {
            players[i].d += 360;
        }

        ad.af--;
        if (ad.af < 0 && players[i].e > 0.1) {
            ad.af = ad.ag;

            for (let i = 0; i < ad.ah; i++) {
                ak = ad.ae.cloneNode(true);
                ak.id = '';
                bottomLayer.appendChild(ak);
                ac.push({
                    x: players[i].x + ((Math.random() * 4) - 2),
                    y: players[i].y + ((Math.random() * 4) - 2),
                    c: ak,
                    life: 30,
                    e: players[i].e / 10,
                    d: (players[i].d - 180) + ((Math.random() * 30) - 15),
                    animate: bubbleParticleAnimation,
                });
            }
        }

        players[i].af--;
        if (players[i].shoot && players[i].af < 0) {
            players[i].af = players[i].ag;

            am = bullet.cloneNode(true);
            am.id = '';
            topLayer.appendChild(am);
            bullets.push({
                owner: i,
                c: am,
                b: am,
                z: 0,
                aa: 0,
                x: players[i].x,
                y: players[i].y,
    //            d: m(players[i].x, players[i].y, q, r),
                d: players[i].d,
                e: 20,
                life: 200,
            });
        }
        players[i].shoot = false;
    }

    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].glitchLog[0]) {
            a(glitches[i].c, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]);
            b(glitches[i].b, glitches[i].glitchLog[0][2], 16, 4);
        }
        if (!glitches[i].glitchLog.shift()) {
            glitches[i].c.remove();
            glitches.splice(i, 1);
        }
    }

    moveGameObjects(players);
    moveGameObjects(bullets);
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < players.length; j++) {
            if (bullets[i].owner == j) {
                continue;
            }
            collisionDistance = n(bullets[i].x, bullets[i].y, players[j].x, players[j].y);
            if (collisionDistance < 20) {
                createExplosion(bullets[i].x, bullets[i].y);

                bullets[i].c.remove();
                bullets.splice(i, 1);
                j = players.length;
                continue bulletLoop;
            }
        }
        bullets[i].life--;
        if (bullets[i].life < 0) {
            createExplosion(bullets[i].x, bullets[i].y);

            bullets[i].c.remove();
            bullets.splice(i, 1);
        }
    }
    
    for (let i = 0; i < ac.length; i++) {
        ac[i].x += o(ac[i].e, ac[i].d);
        ac[i].y += p(ac[i].e, ac[i].d);
        ac[i].animate(ac[i]);

        a(ac[i].c, ac[i].x, ac[i].y);
//        b(ac[i].b, ac[i].d, ac[i].z, ac[i].aa);
        ac[i].life--;
        if (ac[i].life < 0) {
            ac[i].c.remove();
            ac.splice(i, 1);
        }
    }
    
    svgNode.viewBox.baseVal.x = players[0].x - window.innerWidth / 2;
    svgNode.viewBox.baseVal.y = players[0].y - window.innerHeight / 2;
    svgNode.viewBox.baseVal.width = window.innerWidth;
    svgNode.viewBox.baseVal.height = window.innerHeight;
    
    requestAnimationFrame(s);
};

s();

window.addEventListener('gamepadconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
window.addEventListener('gamepaddisconnected', (e) => { 
    controllers = navigator.getGamepads();
}, false);
