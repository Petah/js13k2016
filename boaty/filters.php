<defs>
    <filter id="water">
        <feTurbulence baseFrequency="0.2" result="ripples"/>
        <feGaussianBlur in="ripples" stdDeviation="4" result="rippleBlur"/>
        <feSpecularLighting result="rippleLighting" in="rippleBlur" specularExponent="4" lighting-color="#306bdc">
            <fePointLight x="-200" y="-200" z="100" id="lightingPointLight"/>
        </feSpecularLighting>
        <feComposite in="rippleLighting" operator="arithmetic" k1="0" k2="2" k3="2" k4="0"/>
    </filter>
    <filter id="dropShadow" width="300%" height="300%" x="-50%" y="-50%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
        <feOffset in="blur" dx="2" dy="2" result="offsetBlur" id="offsetBlur"/> 
        <feComponentTransfer in="offsetBlur" result="shadow">
            <feFuncA type="linear" slope="0.2"/>
        </feComponentTransfer>
        <feMerge>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
    </filter>
</defs>
