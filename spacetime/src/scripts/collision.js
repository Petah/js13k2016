calculateRealPosition = (polygon) => {
    currentTransformMatrix = polygon.getCTM();
    transformedPoints = [];
    for (let i = 0; i < polygon.points.length; i++) {
        transformedPoints.push(polygon.points[i].matrixTransform(currentTransformMatrix));
    }
    return transformedPoints;
};

calculateRealPositionXY = (polygon, x, y) => {
    currentTransformMatrix = svgNode.createSVGMatrix();
    currentTransformMatrix.translate(x, y);
    transformedPoints = [];
    for (let i = 0; i < polygon.points.length; i++) {
        transformedPoints.push(polygon.points[i].matrixTransform(currentTransformMatrix));
    }
    return transformedPoints;
};

intersectLineLine = (a1, a2, b1, b2) => {
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

intersectLinePolygon = (a1, a2, points) => {
    let result = [];
    for (let i = 0; i < points.length; i++) {
        result = result.concat(intersectLineLine(a1, a2, points[i], points[(i + 1) % points.length]));
    }
    return result;
};

intersectPolygonPolygon = (points1, points2) => {
    let result = [];
    for (let i = 0; i < points1.length; i++) {
        result = result.concat(intersectLinePolygon(points1[i], points1[(i + 1) % points1.length], points2));
    }
    return result;
};
