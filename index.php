<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/helpers.php';

$layout = load_layout();
$dishCount = active_dish_count($layout);
$ready = has_menu_image() && has_target_file() && $dishCount > 0;
$arUrl = app_url('ar.php');
$menuUrl = has_menu_image() ? asset_url('assets/images/menu.jpg') : '';

$pageTitle = page_title('Home');
$activeNav = 'home';
require __DIR__ . '/includes/header.php';
?>
<section class="hero">
    <div class="shell hero-grid">
        <div class="hero-copy">
            <div class="corner-ornament" aria-hidden="true"></div>
            <?= logo_svg('logo logo-lg') ?>
            <p class="eyebrow"><?= htmlspecialchars(APP_BRAND, ENT_QUOTES, 'UTF-8') ?></p>
            <h1>FOOD MENU</h1>
            <p class="lede">Point your phone at the restaurant menu. When the camera finds a dish photo, a spinning 3D model appears above that photo only — and switches as you move to the next one.</p>
            <p class="flow">Open on your phone → Allow camera → Point at the food menu → Move closer to a food photo → See the 3D food.</p>
            <div class="action-row">
                <a class="btn btn-primary" href="menu.php">Display Menu</a>
                <a class="btn btn-secondary" href="ar.php">Scan Menu in AR</a>
                <a class="btn btn-ghost" href="compile.php">Prepare AR Tracking</a>
            </div>
            <?php if ($ready): ?>
                <p class="banner banner-ok">AR tracking is ready. <?= (int) $dishCount ?> dish<?= $dishCount === 1 ? '' : 'es' ?> mapped.</p>
            <?php elseif (!has_menu_image()): ?>
                <p class="banner">Upload a menu poster in Prepare AR Tracking to get started.</p>
            <?php elseif ($dishCount === 0): ?>
                <p class="banner">Mark food photos in Prepare AR Tracking, then compile.</p>
            <?php else: ?>
                <p class="banner">Compile the tracking target in Prepare AR Tracking before scanning.</p>
            <?php endif; ?>
        </div>
        <figure class="preview-card">
            <?php if ($menuUrl !== ''): ?>
                <img src="<?= htmlspecialchars($menuUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars(APP_BRAND, ENT_QUOTES, 'UTF-8') ?> food menu poster">
                <figcaption>The tracking image. Show this poster full screen, or print it, then scan it.</figcaption>
            <?php else: ?>
                <div class="preview-empty">No menu image yet.</div>
                <figcaption>Upload a menu poster in Prepare AR Tracking.</figcaption>
            <?php endif; ?>
        </figure>
    </div>
</section>

<section class="section">
    <div class="shell split">
        <div>
            <h2>How it works</h2>
            <ol class="steps">
                <li><strong>Display the menu.</strong> Open the poster on a screen or print it. That image is what the camera recognizes.</li>
                <li><strong>Prepare tracking once.</strong> Mark each food photo, then compile the image target. Drag a marker if it is not centered.</li>
                <li><strong>Scan on a phone.</strong> Allow the camera, fill the frame with the menu, then move toward one food photo.</li>
                <li><strong>See one 3D dish.</strong> Only the aimed food appears. Aim at another photo to switch models. Each model slowly spins.</li>
            </ol>
        </div>
        <aside class="qr-card" id="qr-card" data-url="<?= htmlspecialchars($arUrl, ENT_QUOTES, 'UTF-8') ?>">
            <h2>Open on a phone</h2>
            <div id="qr" class="qr-box" aria-label="QR code for the AR scanner"></div>
            <p class="qr-url"><?= htmlspecialchars($arUrl, ENT_QUOTES, 'UTF-8') ?></p>
            <button type="button" class="btn btn-ghost btn-small" id="copy-link">Copy AR link</button>
            <p class="note">Scan the code, allow the camera, then point the phone at the food menu.</p>
        </aside>
    </div>
</section>
<script src="<?= htmlspecialchars(asset_url('assets/js/qrcode.min.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<script src="<?= htmlspecialchars(asset_url('assets/js/home.js'), ENT_QUOTES, 'UTF-8') ?>"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
