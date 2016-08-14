<?php require __DIR__ . '/debug.php'; ?>
<svg id="svgNode">
<defs>
<filter id="water">
    <feTurbulence baseFrequency="0.2" result="ripples" />
    <feGaussianBlur in="ripples" stdDeviation="4" result="rippleBlur" />
    <feSpecularLighting result="rippleLighting" in="rippleBlur" specularExponent="4" lighting-color="#306bdc">
        <fePointLight x="-200" y="-200" z="100" id="lighting" />
    </feSpecularLighting>
    <feComposite in="rippleLighting" operator="arithmetic" k1="0" k2="2" k3="2" k4="0" />
</filter>
    <filter id="dropshadow" width="300%" height="300%">
     <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/> 
      <feOffset dx="10" dy="10" result="offsetblur"/>
      <feMerge> 
        <feMergeNode in="offsetblur"/>
        <feMergeNode in="SourceGraphic"/> 
      </feMerge>
    </filter>
</defs>
<rect x="0" y="0" width="100%" height="100%" style="filter: url(#water);" />
<g id="boatWrapper" transform="translate(0 0)" filter="url(#dropshadow)">
<path id="boat" transform="translate(-16 -4) rotate(0)" d="M32 4L28 2L21 0L5 1L0 2L0 6L5 7L21 8L28 6Z"/>
</g>
<rect x="200" y="200" width="90" height="90" stroke="green" stroke-width="3" fill="yellow" filter="url(#dropshadow)" />
  <path  transform="translate(100 100)" d="
        M142 16 
        L130 8 
        L102 0
        L40 2 
        L0 10 
        
        L0 22
        
        L40 30
        L102 32
        L130 24
        
        Z" fill="#2DA9D6" filter="url(#dropshadow)"></path>

<?php require __DIR__ . '/style.php'; ?>
<?php require __DIR__ . '/script.php'; ?>
