<style><?php
if (isDebug()) {
    require __DIR__ . '/style.css';
    return;
}
require __DIR__ . '/style.min.css';
