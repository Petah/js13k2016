<?php
function isDebug() {
    if (defined('DEBUG')) {
        return DEBUG;
    }
    return true;
}
if (!isDebug()) {
    return;
}
?>
<link rel="stylesheet" href="debug.css" />
<script src="debug.js"></script>
<div id="ups">UPS: 120</div>
