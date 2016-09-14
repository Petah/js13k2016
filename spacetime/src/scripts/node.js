nodes = {};

nodeCreate = (baseNode, layer, init) => {
    if (!nodes[baseNode]) {
        nodes[baseNode] = [];
    }
    if (!nodes[baseNode].length) {
        let elements = [];
        for (let p = 0; p < panes.length; p++) {
            let element = window[baseNode].cloneNode(true);
            element.id = '';
            elements.push(element);
            panes[p].querySelector(layer).appendChild(element);
        }
        nodes[baseNode].push({
            baseNode: baseNode,
            elements: elements,
        });
    }
    let node = nodes[baseNode].pop();
    for (let n = 0; n < node.elements.length; n++) {
        node.elements[n].style.display = '';
        node.elements[n].style.opacity = 1;
        if (init) {
            init(node.elements[n], n);
        }
    }
    return node;
};

nodeDestroy = (node) => {
    for (let n = 0; n < node.elements.length; n++) {
        node.elements[n].style.display = 'none';
    }
    nodes[node.baseNode].push(node);
};
