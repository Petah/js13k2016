checkCollisions = (self, others) => {
    for (let i = 0; i < others.length; i++) {
        if (self.owner && self.owner.id == others[i].id) {
            continue;
        }
        collisionDistance = pointDistance(self.x, self.y, others[i].x, others[i].y);
        if (collisionDistance < self.collisionRadius + others[i].collisionRadius) {
            self.life = 0;
            others[i].life -= self.damage;
            if (['human', 'cpu'].indexOf(self.type) >= 0) {
                self.stats.life.value = 0;
            }
            if (['human', 'cpu'].indexOf(others[i].type) >= 0) {
                others[i].stats.life.value -= self.damage;
                updateHud(others[i], 'life');
            }
            if (others[i].type === 'cpu') {
                for (let j = 0; j < players.length; j++) {
                    if (players[j].id === self.owner.id) {
                        ++players[j].points;
                        if (!split) {
                            killCount.innerText = players[j].points;
                        }
                    }
                }
            }
            break;
        }
    }
};
