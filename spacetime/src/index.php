<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
    <?php require __DIR__ . '/filters.php'; ?>
    <circle id="bubbleParticle" class="bubbleParticle" transform="translate(-100000 -100000)" r="2" style="opacity:.4"/>
    <circle id="explosion" class="explosion" transform="translate(-100000 -100000)" r="10" style="opacity:1"/>
    <polygon id="bullet" class="bullet" transform="translate(-100000 -100000) rotate(0)" points="-10 0 10 0"/>
    <g id="sunStar" transform="translate(0 0) scale(1)">
        <circle class="sunMain" cx="0" cy="0" r="200" fill="url(#sungrad)"/>
        <circle class="sunRing sunRing1" cx="0" cy="0" r="235"/>
        <circle class="sunRing sunRing2" cx="0" cy="0" r="268.5"/>
        <circle class="sunRing sunRing3" cx="0" cy="0" r="300"/>
    </g>
    <g id="planetBlue" transform="translate(-100000 -100000) scale(1)">
        <path class="planetBlue1" transform="rotate(0)" d="M227.3,21.4c29.8,27.4,48.4,66.7,48.4,110.4c0,82.8-67.2,150-150,150 c-28.3,0-54.7-7.8-77.3-21.4C75.1,285,110.8,300,150,300c82.8,0,150-67.2,150-150C300,95.4,270.9,47.7,227.3,21.4z"/>
        <path class="planetBlue2" d="M275.7,131.8c0-43.7-18.7-82.9-48.4-110.4C204.7,7.8,178.3,0,150,0C67.2,0,0,67.2,0,150 c0,43.7,18.7,82.9,48.4,110.4c22.6,13.6,49,21.4,77.3,21.4C208.6,281.8,275.7,214.6,275.7,131.8z"/>
        <ellipse class="planetBlue2" cx="156.7" cy="98.8" rx="37.2" ry="20.9"/>
        <path class="planetBlue3" d="M146.7,205.6c0-9.3-12.2-16.9-27.3-16.9c-15.1,0-27.3,7.6-27.3,16.9c0,0.7,0.1,1.3,0.2,1.9 c-21.4,2-37.8,13.5-37.8,27.4c0,15.3,20,27.7,44.6,27.7c24.7,0,44.6-12.4,44.6-27.7c0-5.9-2.9-11.3-8-15.8 C142.5,216,146.7,211.1,146.7,205.6z"/>
        <path class="planetBlue3" d="M232.7,24.8c-8.8-1.2-17.9-1.9-27.3-1.9C142.8,23,92.2,51.4,92.2,86.5S142.8,150,205.3,150 c38.1,0,71.8-10.6,92.3-26.7C290.2,82.2,266.2,47,232.7,24.8z M156.7,119.6c-20.5,0-37.2-9.3-37.2-20.9c0-11.5,16.7-20.9,37.2-20.9 c20.5,0,37.2,9.3,37.2,20.9C193.9,110.3,177.2,119.6,156.7,119.6z"/>
        <path class="planetBlue4" transform="rotate(0)" d="M227.3,21.4c29.8,27.4,48.4,66.7,48.4,110.4c0,82.8-67.2,150-150,150 c-28.3,0-54.7-7.8-77.3-21.4C75.1,285,110.8,300,150,300c82.8,0,150-67.2,150-150C300,95.4,270.9,47.7,227.3,21.4z"/>    
        <circle r="100" />
    </g>
    <g id="planetGrey" transform="translate(-100000 -100000) scale(1)">
        <path class="planetGrey1" transform="rotate(0)" d="M227.3,21.4c29.8,27.4,48.4,66.7,48.4,110.4c0,82.8-67.2,150-150,150 c-28.3,0-54.7-7.8-77.3-21.4C75.1,285,110.8,300,150,300c82.8,0,150-67.2,150-150C300,95.4,270.9,47.7,227.3,21.4z"/>
        <path class="planetGrey2" d="M275.7,131.8c0-43.7-18.7-82.9-48.4-110.4C204.7,7.8,178.3,0,150,0C67.2,0,0,67.2,0,150 c0,43.7,18.7,82.9,48.4,110.4c22.6,13.6,49,21.4,77.3,21.4C208.6,281.8,275.7,214.6,275.7,131.8z"/>
        <ellipse class="planetGrey2" cx="156.7" cy="98.8" rx="37.2" ry="20.9"/>
        <path class="planetGrey3" d="M146.7,205.6c0-9.3-12.2-16.9-27.3-16.9c-15.1,0-27.3,7.6-27.3,16.9c0,0.7,0.1,1.3,0.2,1.9 c-21.4,2-37.8,13.5-37.8,27.4c0,15.3,20,27.7,44.6,27.7c24.7,0,44.6-12.4,44.6-27.7c0-5.9-2.9-11.3-8-15.8 C142.5,216,146.7,211.1,146.7,205.6z"/>
        <path class="planetGrey3" d="M232.7,24.8c-8.8-1.2-17.9-1.9-27.3-1.9C142.8,23,92.2,51.4,92.2,86.5S142.8,150,205.3,150 c38.1,0,71.8-10.6,92.3-26.7C290.2,82.2,266.2,47,232.7,24.8z M156.7,119.6c-20.5,0-37.2-9.3-37.2-20.9c0-11.5,16.7-20.9,37.2-20.9 c20.5,0,37.2,9.3,37.2,20.9C193.9,110.3,177.2,119.6,156.7,119.6z"/>
        <path class="planetGrey4" transform="rotate(0)" d="M227.3,21.4c29.8,27.4,48.4,66.7,48.4,110.4c0,82.8-67.2,150-150,150 c-28.3,0-54.7-7.8-77.3-21.4C75.1,285,110.8,300,150,300c82.8,0,150-67.2,150-150C300,95.4,270.9,47.7,227.3,21.4z"/>    
        <circle r="100" />
    </g>
    <g id="planetOrange" transform="translate(-100000 -100000) scale(1)" clip-path="url(#planetClip)">
        <circle r="100" class="planetOrange2"/>
        
        <rect x="-120" y="-70" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-120" y="-55" width="130" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-120" y="-40" width="70" height="30" rx="15" ry="15" class="planetOrange3"/>
        
        <rect x="50" y="0" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        <rect x="-40" y="15" width="200" height="30" rx="15" ry="15" class="planetOrange3"/>
        
        <rect x="10" y="75" width="90" height="30" rx="15" ry="15" class="planetOrange3"/>
        
        <circle r="100" class="planetOrange4" mask="url(#planetShadowClip)" transform="rotate(0)"/>
    </g>
    <g id="gridLayer"></g>
    <g id="bottomLayer">
        <g id="stars"></g>
        <g id="solarSystem">
            <g id="planetLayer"></g>            
        </g>
    </g>
    <g id="topLayer">
        <g id="boatWrapper" transform="translate(-100000 -100000)">
            <polygon id="boat" class="boat" transform="translate(-16 -4) rotate(0)" points="32 4 28 2 21 0 5 -10 7 2 7 6 5 18 21 8 28 6"/>
        </g>
    </g>
</svg>
<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
