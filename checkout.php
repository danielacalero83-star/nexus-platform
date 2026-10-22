<?php
require_once __DIR__ . '/config/auth.php';
require_login('checkout.php');

$pdo = get_db();
$user = current_user();
$cart_items = get_cart();
$totals = get_cart_totals();

// Si el carrito esta vacio y no viene de completar una orden, volver al catalogo
if (empty($cart_items) && !isset($_SESSION['last_completed_order'])) {
    header('Location: products.php');
    exit;
}

$completed_order = null;
if (isset($_SESSION['last_completed_order'])) {
    $completed_order = $_SESSION['last_completed_order'];
    unset($_SESSION['last_completed_order']);
}

// Procesar emision formal de la orden
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'process_order') {
    $customer_name = trim($_POST['customer_name'] ?? '');
    $customer_email = trim($_POST['customer_email'] ?? '');
    $shipping_address = trim($_POST['shipping_address'] ?? '');
    $payment_method = trim($_POST['payment_method'] ?? 'CREDIT_CARD');

    if (empty($customer_name) || empty($customer_email) || strlen($shipping_address) < 10) {
        set_flash('danger', 'Formulario incompleto', 'Por favor complete todos los datos de contacto y la direccion detallada de entrega.');
        header('Location: checkout.php');
        exit;
    }

    try {
        $pdo->beginTransaction();

        $subtotal = 0.0;
        $order_items_to_save = [];

        foreach ($cart_items as $item) {
            $stmt = $pdo->prepare("SELECT id, name, price, stock FROM products WHERE id = ?");
            $stmt->execute([$item['id']]);
            $product = $stmt->fetch();

            if (!$product) {
                throw new Exception("El producto con identificador {$item['id']} ya no se encuentra disponible.");
            }

            if ($product['stock'] < $item['quantity']) {
                throw new Exception("Existencias insuficientes para '{$product['name']}'. Solicitado: {$item['quantity']}, Disponible: {$product['stock']}.");
            }

            // Descontar inventario en tiempo real
            $up_stmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
            $up_stmt->execute([$item['quantity'], $product['id']]);

            $line_subtotal = $product['price'] * $item['quantity'];
            $subtotal += $line_subtotal;

            $order_items_to_save[] = [
                'product_id' => $product['id'],
                'product_name' => $product['name'],
                'unit_price' => (float)$product['price'],
                'quantity' => (int)$item['quantity'],
                'subtotal' => $line_subtotal,
            ];
        }

        // Calculo de IVA (13%) y Flete
        $tax = round($subtotal * 0.13, 2);
        $shipping_cost = $subtotal > 1000 ? 0.0 : 45.0;
        $total = round($subtotal + $tax + $shipping_cost, 2);

        // Generacion de correlativo unico de orden
        $random_part = rand(1000, 9999);
        $timestamp_part = substr((string)time(), -4);
        $order_number = 'ORD-' . date('Y') . '-' . $timestamp_part . $random_part;

        // Insercion de la orden principal
        $ord_stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, user_id, customer_name, customer_email,
                shipping_address, subtotal, tax, shipping_cost, total,
                status, payment_method, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, 'PAID')
        ");
        $ord_stmt->execute([
            $order_number,
            $user['id'],
            $customer_name,
            $customer_email,
            $shipping_address,
            $subtotal,
            $tax,
            $shipping_cost,
            $total,
            $payment_method
        ]);
        $order_id = $pdo->lastInsertId();

        // Insercion de articulos asociados
        $item_stmt = $pdo->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($order_items_to_save as $oi) {
            $item_stmt->execute([
                $order_id,
                $oi['product_id'],
                $oi['product_name'],
                $oi['unit_price'],
                $oi['quantity'],
                $oi['subtotal']
            ]);
        }

        $pdo->commit();

        // Limpiar el carrito de compras
        $_SESSION['cart'] = [];

        $_SESSION['last_completed_order'] = [
            'order_number' => $order_number,
            'total' => $total,
        ];

        header('Location: checkout.php');
        exit;
    } catch (Exception $e) {
        $pdo->rollBack();
        set_flash('danger', 'Error al procesar pedido', $e->getMessage());
        header('Location: checkout.php');
        exit;
    }
}

$page_title = 'Formalizacion de Pedido y Checkout';
require_once __DIR__ . '/includes/header.php';
?>

<!-- Vista de Exito cuando se completa la orden -->
<?php if ($completed_order): ?>
    <div class="row justify-content-center py-5">
        <div class="col-md-8 col-lg-6">
            <div class="card card-nexus p-5 text-center shadow-lg border-success">
                <div class="mx-auto mb-3 p-3 rounded-circle bg-success bg-opacity-10 text-success border border-success border-opacity-25" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-check-circle-fill fs-1"></i>
                </div>

                <span class="text-success text-uppercase fw-bold small" style="letter-spacing: 1px;">Transaccion Exitosa</span>
                <h2 class="fw-extrabold text-white mb-2">Orden de Compra Confirmada</h2>
                <p class="text-muted small mb-4">
                    Su requerimiento corporativo ha sido liquidado y registrado con exito en los sistemas contables e inventarios.
                </p>

                <div class="p-3 rounded-3 bg-dark border border-secondary text-start font-monospace small mb-4">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Numero de Orden:</span>
                        <span class="text-primary fw-bold"><?= htmlspecialchars($completed_order['order_number']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Total Liquidado:</span>
                        <span class="text-success fw-bold"><?= format_currency($completed_order['total']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">Estatus:</span>
                        <span class="badge bg-success">Completada / Despacho Inmediato</span>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-2">
                    <a href="orders.php" class="btn btn-nexus-primary flex-fill py-2.5 d-flex align-items-center justify-content-center gap-2">
                        <i class="bi bi-box-seam"></i>
                        <span>Ver en Mis Pedidos</span>
                    </a>
                    <a href="products.php" class="btn btn-nexus-outline flex-fill py-2.5">
                        Continuar en Catalogo
                    </a>
                </div>
            </div>
        </div>
    </div>
<?php else: ?>
    <!-- Formulario de Checkout -->
    <div class="mb-4">
        <div class="d-flex align-items-center gap-2 text-primary small text-uppercase fw-semibold mb-1">
            <i class="bi bi-credit-card"></i> Proceso de Checkout
        </div>
        <h1 class="h2 fw-extrabold text-white mb-1">Liquidacion de Orden Corporativa</h1>
        <p class="text-muted small">Complete los datos de facturacion, entrega fisica de equipamiento y forma de pago.</p>
    </div>

    <div class="row g-4 align-items-start">
        <div class="col-lg-7">
            <form action="checkout.php" method="POST" class="d-flex flex-column gap-4">
                <input type="hidden" name="action" value="process_order">

                <!-- Seccion 1: Datos del Destinatario -->
                <div class="card card-nexus p-4">
                    <h5 class="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                        <span class="badge bg-primary rounded-circle">1</span>
                        Informacion del Destinatario y Contacto
                    </h5>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted">Nombre Completo / Razon Social *</label>
                            <input type="text" name="customer_name" required class="form-control form-control-nexus" value="<?= htmlspecialchars($user['name'] ?? '') ?>" placeholder="Ej. Soluciones Informaticas S.A.">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted">Correo Electronico Corporativo *</label>
                            <input type="email" name="customer_email" required class="form-control form-control-nexus" value="<?= htmlspecialchars($user['email'] ?? '') ?>" placeholder="adquisiciones@empresa.com">
                        </div>

                        <div class="col-12">
                            <label class="form-label small fw-bold text-muted">Direccion de Entrega de Equipamiento *</label>
                            <textarea name="shipping_address" required rows="3" class="form-control form-control-nexus" placeholder="Edificio, nivel de oficina, zona industrial, departamento, referencias tecnicas para recepcion de carga pesada..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Seccion 2: Modalidad de Facturacion y Pago -->
                <div class="card card-nexus p-4">
                    <h5 class="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                        <span class="badge bg-primary rounded-circle">2</span>
                        Modalidad de Facturacion y Pago
                    </h5>

                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="card card-nexus p-3 d-flex flex-column gap-2 text-start h-100 cursor-pointer">
                                <div class="d-flex justify-content-between align-items-center">
                                    <i class="bi bi-credit-card fs-4 text-primary"></i>
                                    <input type="radio" name="payment_method" value="CREDIT_CARD" checked class="form-check-input">
                                </div>
                                <span class="fw-bold text-white small">Tarjeta de Credito</span>
                                <small class="text-muted" style="font-size: 0.7rem;">Visa, Mastercard, Amex Corporativa</small>
                            </label>
                        </div>

                        <div class="col-md-4">
                            <label class="card card-nexus p-3 d-flex flex-column gap-2 text-start h-100 cursor-pointer">
                                <div class="d-flex justify-content-between align-items-center">
                                    <i class="bi bi-bank fs-4 text-primary"></i>
                                    <input type="radio" name="payment_method" value="TRANSFER" class="form-check-input">
                                </div>
                                <span class="fw-bold text-white small">Transferencia SPEI</span>
                                <small class="text-muted" style="font-size: 0.7rem;">Liquidacion bancaria directa</small>
                            </label>
                        </div>

                        <div class="col-md-4">
                            <label class="card card-nexus p-3 d-flex flex-column gap-2 text-start h-100 cursor-pointer">
                                <div class="d-flex justify-content-between align-items-center">
                                    <i class="bi bi-shield-check fs-4 text-primary"></i>
                                    <input type="radio" name="payment_method" value="CORPORATE_CREDIT" class="form-check-input">
                                </div>
                                <span class="fw-bold text-white small">Credito a 30 Dias</span>
                                <small class="text-muted" style="font-size: 0.7rem;">Sujeto a linea de credito aprobada</small>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Boton Confirmar Orden -->
                <button type="submit" class="btn btn-nexus-primary py-3 fs-6 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-lock-fill"></i>
                    <span>Confirmar y Liquidar Pedido (<?= format_currency($totals['total']) ?>)</span>
                </button>
            </form>
        </div>

        <!-- Resumen Lateral de la Orden -->
        <div class="col-lg-5">
            <div class="card card-nexus p-4">
                <h5 class="fw-bold text-white mb-3">
                    Resumen de Articulos (<?= count($cart_items) ?>)
                </h5>

                <div class="d-flex flex-column gap-3 mb-3 pb-3 border-bottom border-secondary-subtle" style="max-height: 320px; overflow-y: auto;">
                    <?php foreach ($cart_items as $item): ?>
                        <div class="d-flex align-items-center gap-3 p-2 rounded-2 bg-dark border border-secondary">
                            <img src="<?= htmlspecialchars($item['image_url']) ?>" alt="<?= htmlspecialchars($item['name']) ?>" class="rounded-2" style="width: 48px; height: 48px; object-fit: cover;">
                            <div class="flex-grow-1 min-w-0">
                                <span class="fw-bold text-white small text-truncate d-block"><?= htmlspecialchars($item['name']) ?></span>
                                <small class="text-muted"><?= $item['quantity'] ?> un. x <?= format_currency($item['price']) ?></small>
                            </div>
                            <span class="fw-bold text-primary small"><?= format_currency($item['price'] * $item['quantity']) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="d-flex flex-column gap-2 small mb-3 pb-3 border-bottom border-secondary-subtle">
                    <div class="d-flex justify-content-between text-muted">
                        <span>Subtotal Neto:</span>
                        <span class="text-white fw-semibold"><?= format_currency($totals['subtotal']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                        <span>IVA (13%):</span>
                        <span class="text-white fw-semibold"><?= format_currency($totals['tax']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                        <span>Flete Asegurado:</span>
                        <span class="text-white fw-semibold">
                            <?= $totals['shipping'] === 0.0 ? '<span class="text-success fw-bold">Gratuito (> $1,000)</span>' : format_currency($totals['shipping']) ?>
                        </span>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-baseline mb-3">
                    <span class="fs-6 fw-bold text-white">Monto a Liquidar:</span>
                    <span class="fs-4 fw-extrabold text-primary"><?= format_currency($totals['total']) ?></span>
                </div>

                <div class="p-2.5 rounded-3 bg-dark border border-secondary text-muted small d-flex align-items-center gap-2">
                    <i class="bi bi-shield-check text-success fs-5"></i>
                    <span style="font-size: 0.75rem;">Verificacion de existencias garantizada bajo transaccion SQL atomica.</span>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
