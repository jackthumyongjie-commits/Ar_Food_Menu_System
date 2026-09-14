<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/helpers.php';

require_post('Use POST to save the layout.');
ensure_writable_dirs();

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    json_response(['ok' => false, 'error' => 'Invalid layout payload.'], 400);
}

$imageWidth = max(1, (int) ($data['imageWidth'] ?? 800));
$imageHeight = max(1, (int) ($data['imageHeight'] ?? 1200));

if (has_menu_image()) {
    $size = @getimagesize(MENU_IMAGE_PATH);
    if (is_array($size)) {
        $imageWidth = (int) $size[0];
        $imageHeight = (int) $size[1];
    }
}

$dishes = [];
if (isset($data['dishes']) && is_array($data['dishes'])) {
    foreach ($data['dishes'] as $dish) {
        if (!is_array($dish)) {
            continue;
        }
        $normalized = normalize_dish($dish, $imageWidth, $imageHeight);
        if ($normalized !== null) {
            $dishes[] = $normalized;
        }
    }
}

$layout = [
    'version' => 1,
    'imageWidth' => $imageWidth,
    'imageHeight' => $imageHeight,
    'dishes' => $dishes,
];

$written = file_put_contents(
    LAYOUT_PATH,
    json_encode($layout, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

if ($written === false) {
    json_response(['ok' => false, 'error' => 'Could not save assets/targets/layout.json. Check folder permissions.'], 500);
}

json_response([
    'ok' => true,
    'message' => 'Layout saved. ' . active_dish_count($layout) . ' dish marker(s) ready.',
    'layout' => $layout,
]);
