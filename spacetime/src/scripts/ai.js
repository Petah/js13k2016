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
    if (true) {
        cpu.speed = Math.min(cpu.speed + cpu.acceleration, cpu.maxSpeed);
        directionDelta = (cpu.direction - pointDirection(cpu.x, cpu.y, closestPlayer.x, closestPlayer.y) + 360) % 360;
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
        cpu.speed = Math.max(cpu.speed - cpu.acceleration, 0);
        cpu.turnSpeed /= 1.2;
    }
};
