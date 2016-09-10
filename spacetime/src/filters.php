<defs>
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
