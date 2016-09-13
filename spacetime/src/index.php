<?php require __DIR__ . '/debug.php'; ?>
<svg class="splitLeft" viewBox="0 0 100 100">
    <?php require __DIR__ . '/filters.php'; ?>
    <g class="bottomLayer"></g>
    <g id="solarSystemLayer">
        <g class="stars"></g>
        <g id="solarSystem">
            <g class="planetLayer"></g>            
        </g>
    </g>
    <g class="topLayer"></g>
    <g class="glitchLayer"></g>
</svg>
<svg class="splitRight" viewBox="0 0 100 100">
    <?php require __DIR__ . '/filters.php'; ?>
    <g class="bottomLayer"></g>
    <g class="solarSystemLayer">
        <g class="stars"></g>
        <g class="solarSystem">
            <g class="planetLayer"></g>            
        </g>
    </g>
    <g class="topLayer"></g>
    <g class="glitchLayer"></g>
</svg>
<svg id="svgStartNode">
    <text x="50vw" y="10vh" id="title">SPACETIME</text>
    <text x="50vw" y="50vh" id="startText">Press Button to Join!</text>
    <text x="25vw" y="70vh" class="link" onclick="split = false; location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high')">Player vs CPU</text>
    <text x="75vw" y="70vh" class="link" onclick="split = true; location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high')">Player vs Player (Split Screen)</text>
    <text x="50vw" y="80vh">Arrows [CTRL] [SHIFT] / XBox Controller [RT] [A] [B]</text>
    <text x="25vw" y="90vh" class="link" onclick="low = false; location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high')">High Quality</text>
    <text x="75vw" y="90vh" class="link" onclick="low = true; location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high')">Low Quality</text>
</svg>
<svg id="svgDeadNode" style="display: none">
    <text x="50vw" y="50vh">YOU DIED!</text>
    <text x="50vw" y="55vh">Coding https://github.com/petah and https://github.com/reybenher</text>
    <text x="50vw" y="60vh">Graphics https://github.com/reybenher</text>
    <text x="50vw" y="65vh">Ships http://kenney.nl/assets</text>
    <text x="50vw" y="70vh">Sound https://github.com/grumdrig/jsfxr and http://humphd.github.io/sfxr.js/</text>
</svg>
<div id="hudLayer"></div>
<svg style="display: none">
    <g id="boatWrapper" class="player1" transform="translate(0 0) rotate(90)">
        <g id="boat" transform="translate(-33.5 -26.5) rotate(0) scale(0.7)">
            <path class="playerBoat0" d="M46.7,2H46l-5.9,13l-0.3,0.3l-1.4-1.4l5.8-12.7c0.1-0.4,0.4-0.7,0.8-0.9C45.3,0.1,45.6,0,46,0h0.7V2 M27.3,63.6 l9.4,9.3h24.3l9.4-9.3l0.8,2l-8.8,8.8c-0.4,0.4-0.9,0.6-1.4,0.6H36.6c-0.6,0-1-0.2-1.4-0.6l-8.8-8.8L27.3,63.6 M57.3,15L51.5,2h-0.7 V0h0.7c0.4,0,0.8,0.1,1.1,0.3l0.8,0.9L59,13.9L57.3,15"/>
            <path class="playerBoat1" d="M57.3,15l19.1,42.4L73,60.8l-2.8,2.8l-9.4,9.3H36.6l-9.4-9.3l-2.8-2.8L21,57.3L40.1,15L46,2h0.7L30.3,53.9 l6.5,11.8h24l6.5-11.8L50.8,2h0.7L57.3,15"/>
            <path class="playerBoat2" d="M46.7,2V0h4v2H46.7 M92.4,53.3l4.6,5.4c0.3,0.4,0.5,0.8,0.5,1.3v4.7c0,0.6-0.2,1-0.6,1.4 c-0.4,0.4-0.9,0.6-1.4,0.6h-5.3h-0.3l0.3-2h5.3v-4.7l-3.6-4.3L92.4,53.3 M7.6,66.7l-0.4,0.1H2c-0.6,0-1-0.2-1.4-0.6 C0.2,65.8,0,65.3,0,64.8v-4.7c0-0.5,0.2-0.9,0.5-1.3L5,53.4l0.6,2.4L2,60.1v4.7h5.3L7.6,66.7"/>
            <path class="playerBoat3" d="M50.8,2l16.5,51.9l-6.5,11.8h-24l-6.5-11.8L46.7,2H50.8 M40,33.1l-0.3,1h18l-0.3-1L51,10.8h-4.6L40,33.1 L40,33.1 M91,60.8l0.9-5l3.6,4.3v4.7h-5.3l0.3-1.2L91,60.8 M7,63.6l0.3,1.2H2v-4.7l3.6-4.3l0.9,5L7,63.6"/>
            <path class="playerBoat4" d="M38.5,13.9l1.4,1.4l-7,8.3L5.6,55.8L5,53.4L38.5,13.9 M57.3,15l1.7-1l33.4,39.4l-0.5,2.5L64.5,23.6L57.3,15"/>
            <path class="playerBoat5" d="M57.3,15l7.3,8.6l16.2,33.6l-3.6,3.6H73l3.4-3.5L57.3,15 M39.9,15.3l0.3-0.3L21,57.3l3.5,3.5h-4.1l-3.6-3.6 l16.1-33.6L39.9,15.3"/>
            <path class="playerBoat6" d="M57.5,33.1l0.3,1h-18l0.3-1l6.4-20.3H51L57.5,33.1"/>
            <path class="playerBoat7" d="M57.5,33.1L51,12.8h-4.6L40,33.1h0l6.5-22.3H51L57.5,33.1"/>
            <path class="playerBoat8" d="M64.5,23.6l27.3,32.3l-0.9,5H77.1l3.6-3.6L64.5,23.6 M5.6,55.8l27.3-32.3L16.8,57.2l3.6,3.6H6.5L5.6,55.8"/>
            <path class="playerBoat9" d="M89.9,66.8l-0.8-0.3l-0.7-0.8H71l-0.8-2h4.1h16.1l-0.3,1.2L89.9,66.8 M26.4,65.6H9.1l-0.8,0.8l-0.7,0.3 l-0.4-1.9L7,63.6h16.1h4.1L26.4,65.6"/>
            <path class="playerBoat10" d="M24.5,60.8l2.8,2.8h-4.1l-2.8-2.8H24.5 M70.2,63.6l2.8-2.8h4.1l-2.8,2.8H70.2"/>
            <path class="playerBoat11" d="M77.1,60.8H91l-0.5,2.8H74.4L77.1,60.8 M23.1,63.6H7l-0.5-2.8h13.9L23.1,63.6"/>
        </g>
        <g>
            <g transform="translate(0 0)"><polygon class="pointer" transform="rotate(0)" points="20 0 0 -8 0 8"/></g>
        </g>
    </g>
    <circle id="starNode"/>
    <g id="glitchParticle" transform="translate(0 0)"><rect x="-5" y="-15" width="10" height="30" rx="5" ry="5" class="planetOrange3" transform="rotate(0) scale(1)" /></g>
    <g id="bubbleParticle" transform="translate(0 0)"><circle class="bubbleParticle" r="2" style="opacity:.4"/></g>
    <g id="explosion" transform="translate(0 0)"><circle class="explosion" /></g>
    <g id="bullet" transform="translate(0 0)"><polygon class="bullet" transform="translate(0 0) rotate(0)" points="-25 0 0 3 3 0 0 -3"/></g>
    <g id="sunStar" transform="translate(0 0) scale(1)">
        <circle class="sunMain" cx="0" cy="0" r="100" fill="url(#sungrad)"/>
        <circle class="sunRing sunRing1" cx="0" cy="0" r="135"/>
        <circle class="sunRing sunRing2" cx="0" cy="0" r="168.5"/>
        <circle class="sunRing sunRing3" cx="0" cy="0" r="200" transform="rotate(0)"/>
    </g>
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
<svg id="hud" transform="translate(0 0) scale(1 1)" width="436" height="86" style="display: none">
    <g id="hudBase">
        <polygon class="hudBase" points="436,48 136,48 120,86 0,86 0,46 436,46" transform="translate(0, 0) scale(1, 1)"/>
        <text class="hudText" transform="translate(10 76)"></text>
    </g>
    <g id="hudBars">
        <rect x="0" y="0" class="hudBar" width="16" height="36"/>
    </g>
</svg>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
