<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
    <?php require __DIR__ . '/filters.php'; ?>
    <g id="gridLayer"></g>
    <g id="bottomLayer"></g>
    <g id="sunStar" transform="translate(0 0) scale(1)">
        <circle class="sunMain" cx="0" cy="0" r="200" fill="url(#sungrad)"/>
        <circle class="sunRing sunRing1" cx="0" cy="0" r="235"/>
        <circle class="sunRing sunRing2" cx="0" cy="0" r="268.5"/>
        <circle class="sunRing sunRing3" cx="0" cy="0" r="300"/>
    </g>
    <g id="solarSystemLayer">
        <g id="stars"></g>
        <g id="solarSystem">
            <g id="planetLayer"></g>            
        </g>
    </g>
    <g id="topLayer">
    </g>
</svg>
<svg style="display: none">
    <g id="boatWrapper" transform="translate(0 0)">
        <polygon id="boat" class="boat" transform="translate(-16 -4) rotate(0)" points="32 4 28 2 21 0 5 -10 7 2 7 6 5 18 21 8 28 6"/>
    </g>
    <circle id="starNode"/>
    <circle id="bubbleParticle" class="bubbleParticle" transform="translate(0 0)" r="2" style="opacity:.4"/>
    <circle id="explosion" class="explosion" transform="translate(0 0)" r="10" style="opacity:1"/>
    <polygon id="bullet" class="bullet" transform="translate(0 0) rotate(0)" points="-10 0 10 0"/>
    <g id="planetBlue" transform="translate(0 0) scale(1)" clip-path="url(#planetClip)">
        <circle class="planetBlue1" r="100"/>
        <ellipse class="planetBlue3" cx="45" cy="-40" rx="90" ry="45"/>
        <ellipse class="planetBlue2" cx="8" cy="-30" rx="26" ry="14"/>
        <ellipse class="planetBlue3" cx="-5" cy="30" rx="20" ry="12"/>
        <ellipse class="planetBlue3" cx="-20" cy="55" rx="38" ry="22"/>
        <circle r="100" class="planetBlue4" mask="url(#planetShadowClip)" transform="rotate(0)"/>
    </g>
    <g id="planetGrey" transform="translate(0 0) scale(1)" clip-path="url(#planetClip)">
        <circle class="planetGrey2" r="100"/>
        <circle class="planetGrey3" cx="-70" cy="-70" r="20"/>
        <circle class="planetGrey3" cx="-22" cy="-22" r="20"/>
        <circle class="planetGrey3" cx="46" cy="-48" r="28"/>
        <circle class="planetGrey3" cx="64" cy="-24" r="12"/>
        <circle class="planetGrey3" cx="-70" cy="48" r="38"/>
        <circle class="planetGrey3" cx="34" cy="32" r="36"/>
        <circle class="planetGrey3" cx="-10" cy="54" r="6"/>
        <circle class="planetGrey3" cx="0" cy="68" r="6"/>
        <circle class="planetGrey3" cx="16" cy="76" r="6"/>
        <circle r="100" class="planetGrey4" mask="url(#planetShadowClip)" transform="rotate(0)"/>
    </g>
    <g id="planetOrange" transform="translate(0 0) scale(1)" clip-path="url(#planetClip)">
        <circle r="100" class="planetOrange2"/>
        <rect x="-120" y="-70" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-120" y="-55" width="130" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-120" y="-40" width="70" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="50" y="0" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-40" y="15" width="200" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="10" y="75" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        <circle r="100" class="planetOrange4" mask="url(#planetShadowClip)" transform="rotate(0)"/>
    </g>
</svg>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
