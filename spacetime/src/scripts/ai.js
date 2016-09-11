ai = (cpu) => {
    closestPlayer = 0;
    closestPlayerDistance = 0;
    for (let j = 0;j < players.length; j++) {
        playerDisatance = pointDistance(cpu.x, cpu.y, players[j].x, players[j].y);
        if (!closestPlayer || closestPlayerDistance > playerDisatance) {
            closestPlayer = players[j];
            closestPlayerDistance = playerDisatance;
        }
    }
    if (Math.random() < 0.8) {
        cpu.currentAcceleration = cpu.acceleration;
        directionDelta = (cpu.facing - pointDirection(cpu.x, cpu.y, closestPlayer.x, closestPlayer.y) + 360) % 360;
        if (closestPlayerDistance < 200) {
            directionDelta = -directionDelta + 360;
        }
        if (directionDelta < 180) {
            if (directionDelta > 3) {
                cpu.turnSpeed = Math.max(cpu.turnSpeed - cpu.turnAcceleration, -cpu.maxTurnSpeed);
            } else {
                cpu.shoot = true;
                cpu.turnSpeed /= 1.2;
            }
        } else if (directionDelta > 180) {
            if (directionDelta < 357) {
                cpu.turnSpeed = Math.min(cpu.turnSpeed + cpu.turnAcceleration, cpu.maxTurnSpeed);
            } else {
                cpu.shoot = true;
                cpu.turnSpeed /= 1.2;
            }
        }
    } else {
        cpu.currentAccelleration = 0;
        cpu.turnSpeed /= 1.2;
    }
};

cpuCount = (points) => (Math.floor(Math.sqrt(points)) || 1);
