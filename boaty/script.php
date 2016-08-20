<script><?php
if (isDebug()) {
    require __DIR__ . '/scripts/math.js';
    require __DIR__ . '/scripts/collision.js';
    require __DIR__ . '/script.js';
} else {
    require __DIR__ . '/script.replace.min.js';
}
?></script>