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
