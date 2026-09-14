<?php
declare(strict_types=1);

/**
 * Change these to your restaurant branding.
 * QR codes and absolute links use the current host automatically.
 *
 * Optional: set APP_PUBLIC_BASE to a phone-reachable URL (LAN IP or HTTPS domain),
 * for example: 'http://192.168.1.10/project/ar_menu'
 * Leave empty to auto-detect from the current request.
 */
const APP_BRAND = 'Jack Resto';
const APP_NAME = 'AR Menu';
const APP_TITLE_SUFFIX = 'Jack Resto';
const APP_PUBLIC_BASE = 'https://vanilla-acts-snake-oscar.trycloudflare.com/project/ar_menu';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
];

define('ROOT_PATH', dirname(__DIR__));
define('IMAGES_PATH', ROOT_PATH . '/assets/images');
define('TARGETS_PATH', ROOT_PATH . '/assets/targets');
define('MENU_IMAGE_PATH', IMAGES_PATH . '/menu.jpg');
define('LAYOUT_PATH', TARGETS_PATH . '/layout.json');
define('TARGET_PATH', TARGETS_PATH . '/menu.mind');
