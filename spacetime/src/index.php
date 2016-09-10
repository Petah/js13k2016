<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
	<?php require __DIR__ . '/filters.php'; ?>
    <circle id="bubbleParticle" class="bubbleParticle" transform="translate(-100 -100)" r="2" style="opacity:.4"/>
    <circle id="explosion" class="explosion" transform="translate(-100 -100)" r="10" style="opacity:1"/>
    <polygon id="bullet" class="bullet" transform="translate(-100 -100) rotate(0)" points="-10 0 10 0"/>
    <g id="bottomLayer">
        <g id="stars"></g>
        <g id="solar-system"></g>
    </g>
    <g id="topLayer">
        <g id="boatWrapper" transform="translate(0 0)" filter="url(#dropShadow)">
            <polygon id="boat" class="boat" transform="translate(-16 -4) rotate(0)" points="32 4 28 2 21 0 5 -10 7 2 7 6 5 18 21 8 28 6"/>
        </g>
    </g>
</svg>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
