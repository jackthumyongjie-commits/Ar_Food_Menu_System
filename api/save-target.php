<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/helpers.php';

require_post('Use POST to save the tracking target.');
ensure_writable_dirs();

if (!isset($_FILES['target']) || !is_array($_FILES['target'])) {
    json_response(['ok' => false, 'error' => 'No tracking file was uploaded.'], 400);
}

$file = $_FILES['target'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_response(['ok' => false, 'error' => 'Could not receive the tracking file.'], 400);
}

$tmp = (string) ($file['tmp_name'] ?? '');
if ($tmp === '' || !is_uploaded_file($tmp)) {
    json_response(['ok' => false, 'error' => 'Invalid tracking upload.'], 400);
}

$size = (int) ($file['size'] ?? 0);
if ($size <= 0 || $size > 50 * 1024 * 1024) {
    json_response(['ok' => false, 'error' => 'Tracking file size is invalid.'], 400);
}

if (!move_uploaded_file($tmp, TARGET_PATH)) {
    json_response(['ok' => false, 'error' => 'Could not save assets/targets/menu.mind. Check folder permissions.'], 500);
}

json_response([
    'ok' => true,
    'message' => 'Tracking target ready. Open Scan Menu in AR on your phone.',
    'targetUrl' => asset_url('assets/targets/menu.mind'),
]);
