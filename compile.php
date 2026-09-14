<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/helpers.php';

$layout = load_layout();
$dishCount = active_dish_count($layout);
$hasMenu = has_menu_image();
$hasTarget = has_target_file();
$stale = $hasMenu && target_is_stale();
$menuUrl = $hasMenu ? asset_url('assets/images/menu.jpg') : '';
$gd = extension_loaded('gd');

$config = [
    'menuUrl' => $menuUrl,
    'hasMenu' => $hasMenu,
    'hasTarget' => $hasTarget,
    'targetStale' => $stale,
    'gd' => $gd,
    'imageWidth' => (int) ($layout['imageWidth'] ?? 800),
    'imageHeight' => (int) ($layout['imageHeight'] ?? 1200),
    'layoutUrl' => 'api/layout.php',
];

$pageTitle = page_title('Prepare AR Tracking');
$activeNav = 'prepare';
require __DIR__ . '/includes/header.php';
?>
<section class="section compile-page">
    <div class="shell">
        <div class="page-head">
            <div>
                <p class="eyebrow">Operator</p>
                <h1>Prepare AR tracking</h1>
                <p class="lede">Upload the menu, mark each food photo, save the layout, then compile the tracking target.</p>
            </div>
            <a class="btn btn-primary" href="ar.php">Go to AR Scanner</a>
        </div>

        <div class="status-row" id="prep-status">
            <span class="chip<?= $hasMenu ? ' chip-ok' : '' ?>">Menu image</span>
            <span class="chip<?= $dishCount > 0 ? ' chip-ok' : '' ?>" id="chip-markers"><?= $dishCount > 0 ? $dishCount . ' marker' . ($dishCount === 1 ? '' : 's') : 'Markers' ?></span>
            <span class="chip<?= $hasTarget && !$stale ? ' chip-ok' : '' ?>" id="chip-target">
                <?= $hasTarget ? ($stale ? 'Tracking needs recompile' : 'Tracking compiled') : 'Tracking not compiled' ?>
            </span>
        </div>

        <div class="compile-grid">
            <div class="poster-panel">
                <?php if ($hasMenu): ?>
                    <div class="poster-stage" id="stage">
                        <img id="poster" src="<?= htmlspecialchars($menuUrl, ENT_QUOTES, 'UTF-8') ?>" alt="Menu poster used for AR tracking">
                        <div class="marker-layer" id="marker-layer"></div>
                    </div>
                    <p class="hint">Click the poster to add a marker. Drag a circle to move it.</p>
                <?php else: ?>
                    <div class="poster-stage is-empty">
                        <p>Upload a menu poster to begin.</p>
                    </div>
                <?php endif; ?>
            </div>

            <aside class="tool-panel">
                <section class="tool-block">
                    <h2>Menu image</h2>
                    <form id="upload-form">
                        <label class="file-btn">
                            Upload new menu
                            <input type="file" id="menu-file" name="menu" accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp">
                        </label>
                    </form>
                    <p class="note">JPG, JPEG, PNG, GIF, or WEBP. Maximum 8 MB. Saved as assets/images/menu.jpg.</p>
                </section>

                <section class="tool-block">
                    <h2>Food photos</h2>
                    <div class="action-row wrap">
                        <button type="button" class="btn btn-secondary" id="detect-btn"<?= $hasMenu ? '' : ' disabled' ?>>Detect food photos</button>
                        <button type="button" class="btn btn-ghost" id="save-btn"<?= $hasMenu ? '' : ' disabled' ?>>Save layout</button>
                    </div>
                    <p class="note" id="detect-note">Markers use normalized positions, so they stay correct if the poster is resized.</p>
                    <div id="marker-list" class="marker-list"></div>
                </section>

                <section class="tool-block">
                    <h2>Compile tracking</h2>
                    <button type="button" class="btn btn-primary" id="compile-btn"<?= $hasMenu ? '' : ' disabled' ?>>Compile tracking target</button>
                    <div class="progress" id="progress" hidden>
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                    <p class="progress-label" id="progress-label"></p>
                    <p class="note">Compiling runs in this browser and can take a minute. Keep the tab open. The result is saved as assets/targets/menu.mind.</p>
                </section>

                <p class="form-error" id="form-error" hidden></p>
                <p class="form-ok" id="form-ok" hidden></p>
            </aside>
        </div>
    </div>
</section>
<script type="application/json" id="compile-config"><?= json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
<script type="importmap">
{
    "imports": {
        "three": "./assets/vendor/three.module.js",
        "three/addons/": "./assets/vendor/addons/"
    }
}
</script>
<script type="module" src="<?= htmlspecialchars(asset_url('assets/js/compile.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
