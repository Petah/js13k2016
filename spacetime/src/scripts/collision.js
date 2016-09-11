checkCollisions = (self, others) => {
    for (let i = 0; i < others.length; i++) {
        if (self.owner && self.owner.id == others[i].id) {
            continue;
        }
        collisionDistance = pointDistance(self.x, self.y, others[i].x, others[i].y);
        if (collisionDistance < self.collisionRadius + others[i].collisionRadius) {
            self.life = 0;
            others[i].life -= self.damage;
            if (others[i].type === 'human') {
                updateHud(others[i], 'life');
            }
            if (others[i].type === 'cpu') {
                for (let j = 0; j < players.length; j++) {
                    if (players[j].id === self.owner.id) {
                        ++players[j].points;
                    }
                }
            }
            break;
        }
    }
};
