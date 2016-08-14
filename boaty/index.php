<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
<?php require __DIR__ . '/filters.php'; ?>
<rect width="100%" height="100%" filter="url(#water)"/>
<g id="boatWrapper" transform="translate(0 0)" filter="url(#dropShadow)">
<path id="boat" transform="translate(-16 -4) rotate(0)" d="M32 4L28 2L21 0L5 1L0 2L0 6L5 7L21 8L28 6Z"/>
</g>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
