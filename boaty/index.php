<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
<?php require __DIR__ . '/filters.php'; ?>
<circle id="bubbleParticle" class="bubbleParticle" transform="translate(0 0)" r="2" style="opacity:.4"/>
<path id="bullet" class="bullet" transform="translate(0 0) rotate(0)" d="M-10 0L10 0"/>
<rect width="100%" height="100%" filter="url(#water)"/>
<g id="landWrapper">
    <path id="land" class="land" d="
        M0 0 
        L0 100 
        L10 50 
        L20 40 
        L30 50 
        L40 20 
        L50 53 
        L60 50 
        L70 60 
        L70 00 
    "/>
</g>
<g id="bottomLayer"></g>
<g id="topLayer">
    <g id="boatWrapper" transform="translate(0 0)" filter="url(#dropShadow)">
        <path id="boat" transform="translate(-16 -4) rotate(0)" d="M32 4L28 2L21 0L5 1L0 2L0 6L5 7L21 8L28 6Z"/>
    </g>
</g>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
