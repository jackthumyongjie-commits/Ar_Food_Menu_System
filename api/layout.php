<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/helpers.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$layout = load_layout();
echo json_encode($layout, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit;
