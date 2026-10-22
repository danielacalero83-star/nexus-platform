<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/auth.php';

$action = $_POST['action'] ?? '';
$product_id = (int)($_POST['product_id'] ?? 0);
$quantity = max(1, (int)($_POST['quantity'] ?? 1));

$pdo = get_db();

if ($action === 'add' && $product_id > 0) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND status = 'ACTIVE'");
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        echo json_encode(['success' => false, 'error' => 'El producto no fue encontrado o se encuentra inactivo.']);
        exit;
    }

    if ($product['stock'] <= 0) {
        echo json_encode(['success' => false, 'error' => 'El producto no cuenta con existencias disponibles.']);
        exit;
    }

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    $current_qty = $_SESSION['cart'][$product_id]['quantity'] ?? 0;
    $new_qty = $current_qty + $quantity;

    if ($new_qty > $product['stock']) {
        $_SESSION['cart'][$product_id] = [
            'id' => $product['id'],
            'name' => $product['name'],
            'slug' => $product['slug'],
            'sku' => $product['sku'],
            'price' => (float)$product['price'],
            'image_url' => $product['image_url'],
            'stock' => (int)$product['stock'],
            'quantity' => (int)$product['stock'],
        ];

        echo json_encode([
            'success' => true,
            'cart_count' => get_cart_count(),
            'message' => "Se alcanzo el maximo disponible ({$product['stock']} unidades).",
        ]);
        exit;
    }

    $_SESSION['cart'][$product_id] = [
        'id' => $product['id'],
        'name' => $product['name'],
        'slug' => $product['slug'],
        'sku' => $product['sku'],
        'price' => (float)$product['price'],
        'image_url' => $product['image_url'],
        'stock' => (int)$product['stock'],
        'quantity' => $new_qty,
    ];

    echo json_encode([
        'success' => true,
        'cart_count' => get_cart_count(),
        'message' => "Se agrego '{$product['name']}' al carrito de compras.",
    ]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Accion no reconocida.']);
