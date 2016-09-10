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
<div id="ups">UPS: 120</div>
