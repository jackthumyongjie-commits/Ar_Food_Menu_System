<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/helpers.php';

require_post('Use POST to upload a menu image.');
ensure_writable_dirs();

if (!isset($_FILES['menu']) || !is_array($_FILES['menu'])) {
    json_response(['ok' => false, 'error' => 'No image was uploaded.'], 400);
}

$file = $_FILES['menu'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_response(['ok' => false, 'error' => 'Upload failed. Please try again.'], 400);
}

if (($file['size'] ?? 0) <= 0 || ($file['size'] ?? 0) > MAX_UPLOAD_BYTES) {
    json_response(['ok' => false, 'error' => 'Image must be 8 MB or smaller.'], 400);
}

$tmp = (string) ($file['tmp_name'] ?? '');
if ($tmp === '' || !is_uploaded_file($tmp)) {
    json_response(['ok' => false, 'error' => 'Invalid upload.'], 400);
}

$info = @getimagesize($tmp);
if ($info === false || empty($info['mime'])) {
    json_response(['ok' => false, 'error' => 'File is not a valid image.'], 400);
}

$mime = strtolower((string) $info['mime']);
if (!isset(ALLOWED_UPLOAD_TYPES[$mime])) {
    json_response(['ok' => false, 'error' => 'Only JPG, JPEG, PNG, GIF, or WEBP are allowed.'], 400);
}

if (!extension_loaded('gd')) {
    json_response(['ok' => false, 'error' => 'PHP GD is required to save the menu image as JPG.'], 500);
}

switch ($mime) {
    case 'image/jpeg':
        $source = @imagecreatefromjpeg($tmp);
        break;
    case 'image/png':
        $source = @imagecreatefrompng($tmp);
        break;
    case 'image/gif':
        $source = @imagecreatefromgif($tmp);
        break;
    case 'image/webp':
        if (!function_exists('imagecreatefromwebp')) {
            json_response(['ok' => false, 'error' => 'WEBP support is not available in PHP GD on this server.'], 500);
        }
        $source = @imagecreatefromwebp($tmp);
        break;
    default:
        $source = false;
}

if ($source === false) {
    json_response(['ok' => false, 'error' => 'Could not read the uploaded image.'], 400);
}

$width = imagesx($source);
$height = imagesy($source);
$canvas = imagecreatetruecolor($width, $height);
if ($canvas === false) {
    imagedestroy($source);
    json_response(['ok' => false, 'error' => 'Could not prepare the image for saving.'], 500);
}

$white = imagecolorallocate($canvas, 255, 255, 255);
imagefilledrectangle($canvas, 0, 0, $width, $height, $white);
imagecopy($canvas, $source, 0, 0, 0, 0, $width, $height);

$saved = imagejpeg($canvas, MENU_IMAGE_PATH, 90);
imagedestroy($source);
imagedestroy($canvas);

if (!$saved) {
    json_response(['ok' => false, 'error' => 'Could not save assets/images/menu.jpg. Check folder permissions.'], 500);
}

// New poster invalidates the previous compiled target until recompiled.
if (is_file(TARGET_PATH)) {
    @unlink(TARGET_PATH);
}

$layout = load_layout();
$layout['imageWidth'] = $width;
$layout['imageHeight'] = $height;
$layout['dishes'] = [];
file_put_contents(
    LAYOUT_PATH,
    json_encode($layout, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

json_response([
    'ok' => true,
    'message' => 'Menu image uploaded.',
    'menuUrl' => asset_url('assets/images/menu.jpg'),
    'imageWidth' => $width,
    'imageHeight' => $height,
]);
