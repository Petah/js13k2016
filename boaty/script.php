<script><?php
if (isDebug()) {
    require __DIR__ . '/script.js';
} else {
    require __DIR__ . '/script.replace.min.js';
}
?></script>