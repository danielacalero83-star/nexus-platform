<?php
// NEXUS Enterprise Platform - Modulo de Seguridad, Sesiones y Autenticacion

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

require_once __DIR__ . '/db.php';

function current_user(): ?array {
    return $_SESSION['user'] ?? null;
}

function is_logged_in(): bool {
    return isset($_SESSION['user']) && !empty($_SESSION['user']['id']);
}

function is_admin(): bool {
    return is_logged_in() && ($_SESSION['user']['role'] ?? '') === 'ADMIN';
}

function require_login(string $redirect = ''): void {
    if (!is_logged_in()) {
        $url = 'login.php' . ($redirect ? '?redirect=' . urlencode($redirect) : '');
        header('Location: ' . $url);
        exit;
    }
}

function require_admin(): void {
    if (!is_admin()) {
        set_flash('error', 'Acceso denegado', 'Esta seccion requiere privilegios de Administrador.');
        header('Location: index.php');
        exit;
    }
}

function login_user(array $user): void {
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ];
}

function logout_user(): void {
    $_SESSION['user'] = null;
    unset($_SESSION['user']);
    unset($_SESSION['cart']);
    session_regenerate_id(true);
}

// Sistema de Notificaciones Flash (Toasts y Alertas sin emojis)
function set_flash(string $type, string $title, string $message = ''): void {
    if (!isset($_SESSION['flashes'])) {
        $_SESSION['flashes'] = [];
    }
    $_SESSION['flashes'][] = [
        'type' => in_array($type, ['success', 'danger', 'warning', 'info']) ? $type : 'info',
        'title' => $title,
        'message' => $message,
    ];
}

function get_flashes(): array {
    $flashes = $_SESSION['flashes'] ?? [];
    unset($_SESSION['flashes']);
    return $flashes;
}

// Formateadores de moneda y fecha
function format_currency(float $amount): string {
    return '$' . number_format($amount, 2, '.', ',');
}

function format_date(string $date_str): string {
    $timestamp = strtotime($date_str);
    if (!$timestamp) return $date_str;
    return date('d/m/Y H:i', $timestamp);
}

// Helpers de Carrito en Sesion
function get_cart(): array {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    return $_SESSION['cart'];
}

function get_cart_count(): int {
    $count = 0;
    foreach (get_cart() as $item) {
        $count += $item['quantity'];
    }
    return $count;
}

function get_cart_totals(): array {
    $subtotal = 0.0;
    foreach (get_cart() as $item) {
        $subtotal += ($item['price'] * $item['quantity']);
    }

    $tax = round($subtotal * 0.13, 2);
    $shipping = (count(get_cart()) > 0) ? ($subtotal > 1000 ? 0.0 : 45.0) : 0.0;
    $total = round($subtotal + $tax + $shipping, 2);

    return [
        'subtotal' => $subtotal,
        'tax' => $tax,
        'shipping' => $shipping,
        'total' => $total,
    ];
}
