<svg id="svgNode" width="100%" height="100%" viewbox="0 0 200 200" preserveAspectRatio="none">
<defs>
    <linearGradient id="planetGradient" x1="0" x2="1" y1="0" y2="1">
        <stop offset="5%" stop-color="#AB3A57" />
        <stop offset="95%" stop-color="#FE8764" />
    </linearGradient>
</defs>
<circle r="100" fill="url(#planetGradient)"/>
<polygon id="playerPolygon" points="-10 0 0 0" transform="translate(0 -200) rotate(0)" />
</svg>
<style>
body {
    margin: 0;
    overflow: hidden;
    background-image: linear-gradient(135deg, #59C2BD 0%, #F0FAE2 100%);
}
polygon {
    stroke: red;
}
circle {
    fill: linear-gradient(135deg, #AB3A57 0%, #FE8764 100%);
}
</style>
<script>
svgNode.viewBox.baseVal.width = window.innerWidth;
svgNode.viewBox.baseVal.height = window.innerHeight;
svgNode.viewBox.baseVal.x = -window.innerWidth / 2;
svgNode.viewBox.baseVal.y = -window.innerHeight / 2;

move = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

rotate = (element, angle, rotationPointX, rotationPointY) => {
    element.transform.baseVal[1].setRotate(angle, rotationPointX, rotationPointY)
};

pointDirection = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

pointDirectionRad = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1);
};

pointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
};

lengthDirX = (length, direction) => {
    return Math.cos(direction * Math.PI / 180) * length;
};

lengthDirY = (length, direction) => {
    return Math.sin(direction * Math.PI / 180) * length;
};

rightDown = false;
leftDown = false;
upDown = false;
window.addEventListener('keyup', function(e) {
    if (e.keyCode == 39) {
        rightDown = false;
    }
    if (e.keyCode == 37) {
        leftDown = false;
    }
    if (e.keyCode == 38) {
        upDown = false;
    }
}, false);

window.addEventListener('keydown', function(e) {
    if (e.keyCode == 39) {
        rightDown = true;
    }
    if (e.keyCode == 37) {
        leftDown = true;
    }
    if (e.keyCode == 38) {
        upDown = true;
    }
}, false);

planet = {
    x: 0,
    y: 0,
    mass: 100000000,
};

player = {
    x: 0,
    y: -200,
    speedX: 0,
    speedY: 0,
    mass: 1,
    translate: playerPolygon,
    rotate: playerPolygon,
};

var GRAVITATIONAL_CONSTANT = 0.00012;
applyGravity = function() {
    player.distance = pointDistance(player.x, player.y, planet.x, planet.y);
    if (player.distance > 100) {
        var force = (GRAVITATIONAL_CONSTANT *((player.mass+ planet.mass) / Math.pow(player.distance,2)));
        var angle = pointDirectionRad(player.x, player.y, planet.x, planet.y);
        player.speedX += force/player.mass*Math.cos(angle);
        player.speedY += force/player.mass*Math.sin(angle);
    }

//    var angle = Math.atan(
// 	 (planet.y-player.y)/
// 	 (planet.x-player.x));

//     player.speed = {
//         x: force/planet.mass*Math.cos(angle),
//         y: force/planet.mass*Math.sin(angle),
//     };
}

function main() {
    applyGravity();

    if (leftDown) {
        player.speedX += lengthDirX(1, pointDirection(player.x, player.y, planet.x, planet.y) + 90);
        player.speedY += lengthDirY(1, pointDirection(player.x, player.y, planet.x, planet.y) + 90);
    }
    if (rightDown) {
        player.speedX -= lengthDirX(1, pointDirection(player.x, player.y, planet.x, planet.y) + 90);
        player.speedY -= lengthDirY(1, pointDirection(player.x, player.y, planet.x, planet.y) + 90);
    }
    if (upDown) {
        player.speedX -= lengthDirX(1, pointDirection(player.x, player.y, planet.x, planet.y));
        player.speedY -= lengthDirY(1, pointDirection(player.x, player.y, planet.x, planet.y));
    }

    player.x += player.speedX;
    player.y += player.speedY;

    player.distance = pointDistance(player.x, player.y, planet.x, planet.y);
    while (player.distance <= 100) {
        player.distance = pointDistance(player.x, player.y, planet.x, planet.y);
        player.speedX = 0;
        player.speedY = 0;
        player.x -= lengthDirX(0.5, pointDirection(player.x, player.y, planet.x, planet.y));
        player.y -= lengthDirY(0.5, pointDirection(player.x, player.y, planet.x, planet.y));
    }
    // console.log(player);
    move(player.translate, player.x, player.y);
    rotate(player.rotate, pointDirection(player.x, player.y, planet.x, planet.y), 0, 0);
    requestAnimationFrame(main);
};

main();

</script>