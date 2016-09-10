for (let p = -10000; p < 10000; p += 100) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    if (p == 0) {
        line.style.stroke = 'rgba(255, 255, 255, 0.4)';
    } else {
        line.style.stroke = 'rgba(255, 255, 255, 0.02)';
    }
    line.style.strokeWidth = '1px';
    line.x1.baseVal.value = -10000;
    line.x2.baseVal.value = 10000;
    line.y1.baseVal.value = p;
    line.y2.baseVal.value = p;
    gridLayer.appendChild(line);
    
    line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    if (p == 0) {
        line.style.stroke = 'rgba(255, 255, 255, 0.4)';
    } else {
        line.style.stroke = 'rgba(255, 255, 255, 0.02)';
    }
    line.style.strokeWidth = '1px';
    line.y1.baseVal.value = -10000;
    line.y2.baseVal.value = 10000;
    line.x1.baseVal.value = p;
    line.x2.baseVal.value = p;
    gridLayer.appendChild(line);
}

