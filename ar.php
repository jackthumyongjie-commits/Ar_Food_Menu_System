<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/helpers.php';

$layout = load_layout();
$dishCount = active_dish_count($layout);
$cssVersion = is_file(ROOT_PATH . '/assets/css/app.css') ? (string) filemtime(ROOT_PATH . '/assets/css/app.css') : (string) time();
$config = [
    'menuUrl' => has_menu_image() ? asset_url('assets/images/menu.jpg') : '',
    'targetUrl' => has_target_file() ? asset_url('assets/targets/menu.mind') : '',
    'layoutUrl' => 'api/layout.php',
    'saveTargetUrl' => 'api/save-target.php',
    'targetReady' => has_target_file(),
    'secureContextNeeded' => true,
    'activeDishCount' => $dishCount,
    'imageWidth' => (int) ($layout['imageWidth'] ?? 800),
    'imageHeight' => (int) ($layout['imageHeight'] ?? 1200),
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#050a09">
    <meta name="mobile-web-app-capable" content="yes">
    <title><?= htmlspecialchars(page_title('Scan Menu'), ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="assets/css/app.css?v=<?= htmlspecialchars($cssVersion, ENT_QUOTES, 'UTF-8') ?>">
    <script type="importmap">
    {
        "imports": {
            "three": "./assets/vendor/three.module.js",
            "three/addons/": "./assets/vendor/addons/"
        }
    }
    </script>
</head>
<body class="ar-body">
    <div id="ar-root">
        <div id="ar-view"></div>
        <div id="ar-ui">
            <div class="ar-top">
                <a class="ar-back" href="index.php">Back</a>
                <p class="ar-ready" id="ar-ready" hidden>AR Ready</p>
                <p class="ar-status" id="ar-status" role="status">Tap to start camera</p>
            </div>
            <div class="scan-frame" id="scan-frame" hidden>
                <span></span><span></span><span></span><span></span>
                <i class="aim-dot"></i>
            </div>
            <div class="aim-lock" id="aim-lock" hidden aria-hidden="true"></div>
            <p class="ar-instruction" id="ar-instruction">Tap to start camera</p>
            <div class="ar-food" id="ar-food" hidden>
                <span>Selected</span>
                <strong id="ar-food-name">—</strong>
            </div>
            <div class="ar-start" id="ar-start">
                <div class="ar-card">
                    <?= logo_svg('logo logo-sm') ?>
                    <h1>Scan the menu</h1>
                    <p id="ar-start-copy">Allow the camera, then point it at the food menu. Put the center mark on a food photo to see its 3D model.</p>
                    <div class="progress" id="ar-progress" hidden><div class="progress-bar" id="ar-progress-bar"></div></div>
                    <p class="progress-label" id="ar-progress-label"></p>
                    <button type="button" class="btn btn-primary" id="start-camera">Tap to start camera</button>
                    <p class="ar-error" id="ar-error" hidden></p>
                    <a class="text-link" href="compile.php">Prepare AR Tracking</a>
                </div>
            </div>
        </div>
    </div>
    <script type="application/json" id="ar-config"><?= json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
    <script type="module" src="<?= htmlspecialchars(asset_url('assets/js/ar.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
</body>
</html>
