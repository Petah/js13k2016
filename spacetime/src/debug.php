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