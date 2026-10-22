<?php
require_once __DIR__ . '/config/auth.php';
require_login('orders.php');

$pdo = get_db();
$user = current_user();
$page_title = 'Mis Pedidos y Trazabilidad';

// Obtener ordenes del usuario autenticado
$stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<div class="mb-4">
    <div class="d-flex align-items-center gap-2 text-primary small text-uppercase fw-semibold mb-1">
        <i class="bi bi-box-seam"></i> Trazabilidad Operativa
    </div>
    <h1 class="h2 fw-extrabold text-white mb-1">Historial de Pedidos y Adquisiciones</h1>
    <p class="text-muted small">Consulte el estado contable, despacho de carga y detalle de equipos solicitados.</p>
</div>

<?php if (empty($orders)): ?>
    <div class="card card-nexus p-5 text-center my-4">
        <div class="mx-auto mb-3 p-3 rounded-circle bg-dark border border-secondary text-muted" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
            <i class="bi bi-receipt fs-1"></i>
        </div>
        <h4 class="fw-bold text-white mb-2">No posee pedidos registrados</h4>
        <p class="text-muted small mx-auto mb-4" style="max-w: 420px;">
            Aun no ha formalizado ninguna orden de equipamiento tecnologico. Visite nuestro catalogo para iniciar su primer requerimiento.
        </p>
        <div>
            <a href="products.php" class="btn btn-nexus-primary py-2.5 px-4 d-inline-flex align-items-center gap-2">
                <span>Ir al Catalogo de Equipos</span>
                <i class="bi bi-arrow-right"></i>
            </a>
        </div>
    </div>
<?php else: ?>
    <div class="d-flex flex-column gap-4 mb-5">
        <?php foreach ($orders as $order): ?>
            <?php
            // Obtener items asociados
            $item_stmt = $pdo->prepare("
                SELECT oi.*, p.image_url, p.sku
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $item_stmt->execute([$order['id']]);
            $items = $item_stmt->fetchAll();
            ?>
            <div class="card card-nexus overflow-hidden">
                <!-- Cabecera de la Orden -->
                <div class="card-header bg-dark border-secondary p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div class="d-flex flex-wrap gap-4 text-start">
                        <div>
                            <span class="text-muted small d-block">Numero de Orden</span>
                            <span class="font-monospace fw-bold text-white"><?= htmlspecialchars($order['order_number']) ?></span>
                        </div>
                        <div>
                            <span class="text-muted small d-block">Fecha de Emision</span>
                            <span class="text-light small fw-semibold"><?= format_date($order['created_at']) ?></span>
                        </div>
                        <div>
                            <span class="text-muted small d-block">Metodo de Pago</span>
                            <span class="badge bg-secondary"><?= htmlspecialchars($order['payment_method']) ?></span>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-3">
                        <?php
                        $status_badge = 'bg-secondary';
                        switch ($order['status']) {
                            case 'COMPLETED': $status_badge = 'bg-success'; break;
                            case 'PROCESSING': $status_badge = 'bg-warning text-dark'; break;
                            case 'SHIPPED': $status_badge = 'bg-info text-dark'; break;
                            case 'CANCELLED': $status_badge = 'bg-danger'; break;
                        }
                        ?>
                        <span class="badge <?= $status_badge ?> py-2 px-3 small">
                            <?= htmlspecialchars($order['status']) ?>
                        </span>
                        <span class="fs-5 fw-extrabold text-primary">
                            <?= format_currency((float)$order['total']) ?>
                        </span>
                    </div>
                </div>

                <!-- Detalle de Articulos -->
                <div class="card-body p-4">
                    <div class="d-flex flex-column gap-3 mb-3">
                        <?php foreach ($items as $it): ?>
                            <div class="d-flex justify-content-between align-items-center p-2 rounded bg-black bg-opacity-25 border border-secondary-subtle">
                                <div class="d-flex align-items-center gap-3">
                                    <?php if (!empty($it['image_url'])): ?>
                                        <img src="<?= htmlspecialchars($it['image_url']) ?>" alt="<?= htmlspecialchars($it['product_name']) ?>" class="rounded" style="width: 48px; height: 48px; object-fit: cover;">
                                    <?php endif; ?>
                                    <div>
                                        <span class="fw-bold text-white small d-block"><?= htmlspecialchars($it['product_name']) ?></span>
                                        <small class="text-muted">Cantidad: <?= $it['quantity'] ?> un. x <?= format_currency((float)$it['unit_price']) ?></small>
                                    </div>
                                </div>
                                <span class="fw-bold text-light small"><?= format_currency((float)$it['subtotal']) ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center pt-2 border-top border-secondary-subtle text-muted small gap-2">
                        <div>
                            <strong>Direccion de Entrega:</strong> <?= htmlspecialchars($order['shipping_address']) ?>
                        </div>
                        <div class="text-sm-end">
                            Subtotal: <?= format_currency((float)$order['subtotal']) ?> | IVA: <?= format_currency((float)$order['tax']) ?> | Flete: <?= format_currency((float)$order['shipping_cost']) ?>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
