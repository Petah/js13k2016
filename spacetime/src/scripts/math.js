pointDirection = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
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

motionAdd = (speed1, direction1, speed2, direction2) => {
    let x2 = lengthDirX(speed1, direction1) + lengthDirX(speed2, direction2);
    let y2 = lengthDirY(speed1, direction1) + lengthDirY(speed2, direction2);
    return [Math.hypot(x2, y2), pointDirection(0, 0, x2, y2)]
};

randomSign = () => Math.random() > 0.5 ? -1 : 1;
