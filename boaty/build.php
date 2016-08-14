<?php
define('DEBUG', false);

echo 'Minifying style.css' . PHP_EOL . PHP_EOL;
exec('node_modules\.bin\cleancss -o style.min.css style.css');

echo 'Replacing tokens in script.js' . PHP_EOL . PHP_EOL;
$script = PHP_EOL . file_get_contents(__DIR__ . '/script.js');

$token = 'a';
$getToken = function() use(&$token) {
    return $token++;
};

$tokens = [
    'move' => $getToken(),
    'rotate' => $getToken(),
    'translate' => $getToken(),
    'direction' => $getToken(),
    'speed' => $getToken(),
    'maxSpeed' => $getToken(),
    'turnSpeed' => $getToken(),
    'maxTurnSpeed' => $getToken(),
    'turnAcceleration' => $getToken(),
    'acceleration' => $getToken(),
    'pointDirection' => $getToken(),
    'pointDistance' => $getToken(),
    'lengthDirX' => $getToken(),
    'lengthDirY' => $getToken(),
    'mouseX' => $getToken(),
    'mouseY' => $getToken(),
    'main' => $getToken(),
    'directionDelta' => $getToken(),
    'mouseDown' => $getToken(),
    'player' => $getToken(),
];

foreach ($tokens as $find => $replace) {
    $find = preg_quote($find, '/');
    $script = preg_replace("/([^a-zA-Z0-9])({$find})([^a-zA-Z0-9])/", '$1' . $replace . '$3', $script);
}

file_put_contents(__DIR__ . '/script.replace.js', $script);

echo 'Minifying script.js' . PHP_EOL . PHP_EOL;
exec('node_modules\.bin\esminify script.replace.js');


echo 'Reading index.php' . PHP_EOL . PHP_EOL;
ob_start();
require __DIR__ . '/index.php';
$index = ob_get_clean();

echo 'Uncompressed length: ' . strlen($index) . PHP_EOL . PHP_EOL;

echo 'Creating index.min.html' . PHP_EOL . PHP_EOL;
file_put_contents(__DIR__ . '/index.min.html', $index);

echo 'Deleting boaty.zip' . PHP_EOL . PHP_EOL;
unlink(__DIR__ . '/boaty.zip');

echo 'Compressing boaty.zip' . PHP_EOL . PHP_EOL;
exec('kzip boaty.zip index.min.html');

echo 'Final size: ' . filesize(__DIR__ . '/boaty.zip') . PHP_EOL . PHP_EOL;
