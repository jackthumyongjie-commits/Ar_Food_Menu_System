<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/helpers.php';

$pageTitle = page_title('Display Menu');
$activeNav = 'menu';
$menuUrl = has_menu_image() ? asset_url('assets/images/menu.jpg') : '';
require __DIR__ . '/includes/header.php';
?>
<section class="section menu-page">
    <div class="shell">
        <div class="page-head">
            <div>
                <p class="eyebrow">Tracking image</p>
                <h1>Food menu</h1>
                <p class="lede">This is the poster the camera recognizes. Keep it flat, well lit, and fully visible.</p>
            </div>
            <div class="action-row">
                <a class="btn btn-primary" href="ar.php">Scan Menu in AR</a>
                <a class="btn btn-ghost" href="compile.php">Prepare AR Tracking</a>
            </div>
        </div>
        <?php if ($menuUrl !== ''): ?>
            <figure class="menu-frame">
                <img src="<?= htmlspecialchars($menuUrl, ENT_QUOTES, 'UTF-8') ?>" alt="Full <?= htmlspecialchars(APP_BRAND, ENT_QUOTES, 'UTF-8') ?> food menu">
            </figure>
            <p class="hint">On a desktop, open this page full screen and scan it with your phone. A printed copy tracks more reliably than a glossy screen.</p>
        <?php else: ?>
            <p class="banner">No menu image yet. Upload one in <a href="compile.php">Prepare AR Tracking</a>.</p>
        <?php endif; ?>
    </div>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
