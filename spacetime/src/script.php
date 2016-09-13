<script><?php
if (isDebug()) {
    require __DIR__ . '/scripts/sound.js';
    require __DIR__ . '/scripts/sound-gen.js';
    require __DIR__ . '/scripts/math.js';
    require __DIR__ . '/scripts/game.js';
    require __DIR__ . '/scripts/collision.js';
    require __DIR__ . '/scripts/control-gamepad.js';
    require __DIR__ . '/scripts/control-keyboard.js';
    // require __DIR__ . '/scripts/control-mouse.js';
    require __DIR__ . '/scripts/ai.js';
    require __DIR__ . '/scripts/state-start.js';
    require __DIR__ . '/scripts/state-game.js';
    require __DIR__ . '/scripts/state-dead.js';
    require __DIR__ . '/script.js';
} else {
    require __DIR__ . '/../build/script.replace.min.js';
}
?></script><?php if (isDebug()): ?>
<script src="debug.js"></script>
<?php endif; ?>