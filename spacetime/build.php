<?php
define('DEBUG', false);

echo 'Minifying style.css' . PHP_EOL . PHP_EOL;
exec('node_modules\.bin\cleancss -o build/style.min.css src/style.css');

echo 'Replacing tokens in script.js' . PHP_EOL . PHP_EOL;
$script = PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/sound.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/sound-gen.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/math.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/game.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/node.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/collision.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/control-keyboard.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/control-gamepad.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/ai.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/state-start.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/state-game.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/scripts/state-dead.js');
$script .= PHP_EOL . file_get_contents(__DIR__ . '/src/script.js');
$script = preg_replace('~//debug.*?///debug~s', '', $script);

$token = 'a';
$getToken = function() use(&$token) {
    while ($token == 'i' || $token == 'j' || $token == 'p' || $token == 'x' || $token == 'y') {
        $token++;
    }
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
    'boundingBox' => $getToken(),
    'rotationPointX' => $getToken(),
    'rotationPointY' => $getToken(),
    'gameObjects' => $getToken(),
    'particles' => $getToken(),
    'emitter' => $getToken(),
    'particle' => $getToken(),
//    'bubbleParticle' => $getToken(),
    'reloading' => $getToken(),
    'reloadTime' => $getToken(),
    'amount' => $getToken(),
    'mouseMoveDown' => $getToken(),
    'mouseShootDown' => $getToken(),
    'particleClone' => $getToken(),
    'mouseShootDown' => $getToken(),
    'bulletClone' => $getToken(),
    'intersectLineLine' => $getToken(),
    'intersectLinePolygon' => $getToken(),
    'intersectPolygonPolygon' => $getToken(),
    'calculateRealPosition' => $getToken(),
    'currentTransformMatrix' => $getToken(),
    'transformedPoints' => $getToken(),
    'currentX' => $getToken(),
    'currentY' => $getToken(),
    'randomLandPoints' => $getToken(),
];

foreach ($tokens as $find => $replace) {
    $find = preg_quote($find, '/');
    $script = preg_replace("/([^a-zA-Z0-9])({$find})([^a-zA-Z0-9])/", '$1' . $replace . '$3', $script);
}

file_put_contents(__DIR__ . '/build/script.replace.js', $script);

echo 'Minifying script.js' . PHP_EOL . PHP_EOL;
exec('node_modules\.bin\esminify build/script.replace.js');


echo 'Reading index.php' . PHP_EOL . PHP_EOL;
ob_start();
require __DIR__ . '/src/index.php';
$index = ob_get_clean();

$index = preg_replace('/\s+/', ' ', $index);
$index = str_replace('> <', '><', $index);

$tokens = [
    'boat' => $getToken(),
    'boatWrapper' => $getToken(),
    'dropShadow' => $getToken(),
    'water' => $getToken(),
    'lightingPointLight' => $getToken(),
    'sun' => $getToken(),
    'ripples' => $getToken(),
    'rippleBlur' => $getToken(),
    'rippleLighting' => $getToken(),
    'blur' => $getToken(),
    'offsetBlur' => $getToken(),
    'shadow' => $getToken(),
];

foreach ($tokens as $find => $replace) {
    $find = preg_quote($find, '/');
    $index = preg_replace("/([^a-zA-Z0-9])({$find})([^a-zA-Z0-9])/", '$1' . $replace . '$3', $index);
}

echo 'Uncompressed length: ' . strlen($index) . PHP_EOL . PHP_EOL;

echo 'Creating index.min.html' . PHP_EOL . PHP_EOL;
file_put_contents(__DIR__ . '/build/index.min.html', $index);

echo 'Deleting spacetime.zip' . PHP_EOL . PHP_EOL;
unlink(__DIR__ . '/build/spacetime.zip');

echo 'Compressing spacetime.zip' . PHP_EOL . PHP_EOL;
exec('kzip build/spacetime.zip build/index.min.html');

echo 'Final size: ' . filesize(__DIR__ . '/build/spacetime.zip') . PHP_EOL . PHP_EOL;
