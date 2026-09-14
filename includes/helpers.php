<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function app_base_url(): string
{
    static $base = null;
    if ($base !== null) {
        return $base;
    }

    if (APP_PUBLIC_BASE !== '') {
        $base = rtrim(APP_PUBLIC_BASE, '/');
        return $base;
    }

    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $isLocal = (bool) preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/i', $host);
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    // Local PC stays on HTTP to avoid certificate warnings in some browsers.
    $scheme = ($isLocal || !$https) ? 'http' : 'https';

    $docRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '') ?: '';
    $appRoot = realpath(ROOT_PATH) ?: ROOT_PATH;
    $docRoot = str_replace('\\', '/', $docRoot);
    $appRoot = str_replace('\\', '/', $appRoot);

    $rel = '';
    if ($docRoot !== '' && str_starts_with($appRoot, $docRoot)) {
        $rel = trim(substr($appRoot, strlen($docRoot)), '/');
    }

    // Fallback for environments where DOCUMENT_ROOT does not resolve cleanly.
    if ($rel === '' && !empty($_SERVER['SCRIPT_NAME'])) {
        $scriptDir = str_replace('\\', '/', dirname((string) $_SERVER['SCRIPT_NAME']));
        if (basename($scriptDir) === 'api') {
            $scriptDir = dirname($scriptDir);
        }
        $rel = trim($scriptDir, '/');
    }

    $base = $scheme . '://' . $host . ($rel !== '' ? '/' . $rel : '');
    return $base;
}

function app_url(string $path = ''): string
{
    $path = ltrim(str_replace('\\', '/', $path), '/');
    return rtrim(app_base_url(), '/') . ($path !== '' ? '/' . $path : '');
}

function asset_url(string $relativePath): string
{
    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    $full = ROOT_PATH . '/' . $relativePath;
    $version = is_file($full) ? (string) filemtime($full) : (string) time();
    return $relativePath . '?v=' . $version;
}

function page_title(string $page): string
{
    return $page . ' · ' . APP_TITLE_SUFFIX;
}

function has_menu_image(): bool
{
    return is_file(MENU_IMAGE_PATH) && filesize(MENU_IMAGE_PATH) > 0;
}

function has_target_file(): bool
{
    return is_file(TARGET_PATH) && filesize(TARGET_PATH) > 0;
}

function default_layout(): array
{
    return [
        'version' => 1,
        'imageWidth' => 800,
        'imageHeight' => 1200,
        'dishes' => [],
    ];
}

function load_layout(): array
{
    if (!is_file(LAYOUT_PATH)) {
        return default_layout();
    }

    $raw = file_get_contents(LAYOUT_PATH);
    if ($raw === false || $raw === '') {
        return default_layout();
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return default_layout();
    }

    $layout = default_layout();
    $layout['version'] = (int) ($data['version'] ?? 1);
    $layout['imageWidth'] = (int) ($data['imageWidth'] ?? $layout['imageWidth']);
    $layout['imageHeight'] = (int) ($data['imageHeight'] ?? $layout['imageHeight']);
    $layout['dishes'] = is_array($data['dishes'] ?? null) ? array_values($data['dishes']) : [];

    if (has_menu_image()) {
        $size = @getimagesize(MENU_IMAGE_PATH);
        if (is_array($size)) {
            $layout['imageWidth'] = (int) $size[0];
            $layout['imageHeight'] = (int) $size[1];
        }
    }

    return $layout;
}

function active_dish_count(array $layout): int
{
    $count = 0;
    foreach ($layout['dishes'] as $dish) {
        $type = (string) ($dish['type'] ?? '');
        if ($type !== '' && $type !== 'ignore') {
            $count++;
        }
    }
    return $count;
}

function target_is_stale(): bool
{
    if (!has_menu_image() || !has_target_file()) {
        return !has_target_file();
    }
    return filemtime(MENU_IMAGE_PATH) > filemtime(TARGET_PATH);
}

function logo_svg(string $class = 'logo logo-sm'): string
{
    return '<svg class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '" viewBox="0 0 80 80" aria-hidden="true">'
        . '<polygon points="40,4 70,20 70,56 40,74 10,56 10,20" fill="none" stroke="#2dc494" stroke-width="3"/>'
        . '<path d="M33 24c0 8 2 12 2 18h4c0-6 2-10 2-18" fill="none" stroke="#2dc494" stroke-width="2.4" stroke-linecap="round"/>'
        . '<path d="M31 22h8M34 46v10M40 46v10" fill="none" stroke="#2dc494" stroke-width="2.4" stroke-linecap="round"/>'
        . '<path d="M48 22l8 28" fill="none" stroke="#2dc494" stroke-width="2.4" stroke-linecap="round"/>'
        . '<path d="M46 22h6M52 46l4 4" fill="none" stroke="#2dc494" stroke-width="2.4" stroke-linecap="round"/>'
        . '</svg>';
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function require_post(string $message): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        json_response(['ok' => false, 'error' => $message], 405);
    }
}

function ensure_writable_dirs(): void
{
    foreach ([IMAGES_PATH, TARGETS_PATH] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}

function normalize_dish(array $dish, int $imageWidth, int $imageHeight): ?array
{
    $id = trim((string) ($dish['id'] ?? ''));
    $type = trim((string) ($dish['type'] ?? 'ignore'));
    if ($id === '') {
        return null;
    }

    $nx = (float) ($dish['nx'] ?? 0.5);
    $ny = (float) ($dish['ny'] ?? 0.5);
    $nx = max(0.0, min(1.0, $nx));
    $ny = max(0.0, min(1.0, $ny));
    $radius = (float) ($dish['radius'] ?? 0.1);
    $radius = max(0.04, min(0.4, $radius));
    $aspect = $imageHeight / max(1, $imageWidth);
    $x = $nx - 0.5;
    $y = (0.5 - $ny) * $aspect;
    $labeled = $type !== '' && $type !== 'ignore';
    $name = trim((string) ($dish['name'] ?? ''));
    if ($name === '') {
        $name = $labeled ? ucwords(str_replace(['_', '-'], ' ', $type)) : 'Ignore';
    }

    return [
        'id' => $id,
        'type' => $type,
        'name' => $name,
        'nx' => round($nx, 5),
        'ny' => round($ny, 5),
        'x' => round($x, 5),
        'y' => round($y, 5),
        'arx' => round($x, 5),
        'ary' => round($y, 5),
        'z' => (float) ($dish['z'] ?? ($labeled ? 0.06 : 0)),
        'rx' => (float) ($dish['rx'] ?? ($labeled ? 0.5 : 0)),
        'ry' => (float) ($dish['ry'] ?? ($dish['rotation'] ?? ($labeled ? 0.2 : 0))),
        'rotation' => (float) ($dish['rotation'] ?? ($dish['ry'] ?? ($labeled ? 0.2 : 0))),
        'radius' => round($radius, 5),
        'scale' => round((float) ($dish['scale'] ?? max(0.18, min(0.42, $radius * 2.15))), 5),
    ];
}
