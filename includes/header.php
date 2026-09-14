<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

/** @var string $pageTitle */
/** @var string $activeNav */
/** @var string|null $bodyClass */

$pageTitle = $pageTitle ?? page_title('Home');
$activeNav = $activeNav ?? '';
$bodyClass = $bodyClass ?? '';
$cssVersion = is_file(ROOT_PATH . '/assets/css/app.css') ? (string) filemtime(ROOT_PATH . '/assets/css/app.css') : (string) time();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#071210">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/app.css?v=<?= htmlspecialchars($cssVersion, ENT_QUOTES, 'UTF-8') ?>">
</head>
<body<?= $bodyClass !== '' ? ' class="' . htmlspecialchars($bodyClass, ENT_QUOTES, 'UTF-8') . '"' : '' ?>>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
    <div class="shell header-row">
        <a class="brand" href="index.php">
            <?= logo_svg('logo logo-sm') ?>
            <span><strong><?= htmlspecialchars(explode(' ', APP_BRAND)[0] ?? APP_BRAND, ENT_QUOTES, 'UTF-8') ?></strong><em><?= htmlspecialchars(APP_NAME, ENT_QUOTES, 'UTF-8') ?></em></span>
        </a>
        <nav class="nav" aria-label="Primary">
            <a href="index.php"<?= $activeNav === 'home' ? ' class="is-active"' : '' ?>>Home</a>
            <a href="menu.php"<?= $activeNav === 'menu' ? ' class="is-active"' : '' ?>>Menu</a>
            <a href="ar.php"<?= $activeNav === 'scan' ? ' class="is-active"' : '' ?>>Scan</a>
            <a href="compile.php"<?= $activeNav === 'prepare' ? ' class="is-active"' : '' ?>>Prepare</a>
        </nav>
    </div>
</header>
<main id="main">
