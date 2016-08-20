<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
<?php require __DIR__ . '/filters.php'; ?>
<circle id="bubbleParticle" class="bubbleParticle" transform="translate(0 0)" r="2" style="opacity:.4"/>
<circle id="explosion" class="explosion" transform="translate(0 0)" r="10" style="opacity:1"/>
<polygon id="bullet" class="bullet" transform="translate(0 0) rotate(0)" points="-10 0 10 0"/>
<rect width="100%" height="100%" filter="url(#water)"/>
<g id="landWrapper">
    <polygon id="land" class="land" points="
        0 0 
        0 100 
        10 50 
        20 40 
        30 50 
        40 20 
        50 53 
        60 50 
        70 60 
        70 00 
    "/>
</g>
<g id="bottomLayer"></g>
<g id="topLayer">
    <g id="boatWrapper" transform="translate(0 0)" filter="url(#dropShadow)">
        <polygon id="boat" class="boat" transform="translate(-16 -4) rotate(0)" points="32 4 28 2 21 0 5 1 0 2 0 6 5 7 21 8 28 6"/>
    </g>
</g>
</svg>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
