<?php
define('IS_ADMIN_SECTION', true);
require_once __DIR__ . '/../config/auth.php';
require_admin();

$pdo = get_db();
$page_title = 'Gestion de Ordenes y Pedidos';

// Actualizacion de estatus de orden
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $order_id = (int)($_POST['order_id'] ?? 0);
    $status = trim($_POST['status'] ?? '');

    $allowed = ['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if ($order_id > 0 && in_array($status, $allowed)) {
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $order_id]);
        set_flash('success', 'Estatus actualizado', "La orden #$order_id se encuentra ahora en estado $status.");
    } else {
        set_flash('danger', 'Error', 'El estatus seleccionado es invalido.');
    }
    header('Location: orders.php');
    exit;
}

// Consulta de todas las ordenes
$stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
$orders = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
    <div>
        <div class="d-flex align-items-center gap-2 text-warning small text-uppercase fw-semibold mb-1">
            <i class="bi bi-receipt-cutoff"></i> Despacho y Facturacion
        </div>
        <h1 class="h2 fw-extrabold text-white mb-0">Control de Ordenes de Clientes</h1>
        <small class="text-muted">Supervision del ciclo de vida de los pedidos corporativos y cambios de estado.</small>
    </div>

    <div>
        <a href="index.php" class="btn btn-nexus-outline btn-sm py-2 px-3">
            <i class="bi bi-arrow-left me-1"></i>Volver al Panel Principal
        </a>
    </div>
</div>

<div class="card card-nexus overflow-hidden mb-5">
    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle mb-0 text-start small">
            <thead class="border-secondary text-muted text-uppercase">
                <tr>
                    <th class="p-3">Correlativo</th>
                    <th class="p-3">Cliente / Contacto</th>
                    <th class="p-3">Fecha</th>
                    <th class="p-3">Lineas</th>
                    <th class="p-3">Total Liquidado</th>
                    <th class="p-3">Estado Actual</th>
                    <th class="p-3 text-end" style="width: 220px;">Cambiar Estatus</th>
                </tr>
            </thead>
            <tbody class="divide-secondary">
                <?php if (empty($orders)): ?>
                    <tr>
                        <td colspan="7" class="p-4 text-center text-muted">No existen ordenes registradas en el sistema.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($orders as $ord): ?>
                        <?php
                        $items_stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
                        $items_stmt->execute([$ord['id']]);
                        $order_items = $items_stmt->fetchAll();
                        ?>
                        <tr>
                            <td class="p-3 font-monospace fw-bold text-white"><?= htmlspecialchars($ord['order_number']) ?></td>
                            <td class="p-3">
                                <span class="fw-semibold text-white d-block"><?= htmlspecialchars($ord['customer_name']) ?></span>
                                <small class="text-muted"><?= htmlspecialchars($ord['customer_email']) ?></small>
                            </td>
                            <td class="p-3 text-muted"><?= format_date($ord['created_at']) ?></td>
                            <td class="p-3">
                                <span class="badge bg-secondary"><?= count($order_items) ?> articulos</span>
                            </td>
                            <td class="p-3 text-primary fw-bold"><?= format_currency((float)$ord['total']) ?></td>
                            <td class="p-3">
                                <?php
                                $badge = 'bg-secondary';
                                if ($ord['status'] === 'COMPLETED') $badge = 'bg-success';
                                elseif ($ord['status'] === 'PROCESSING') $badge = 'bg-warning text-dark';
                                elseif ($ord['status'] === 'SHIPPED') $badge = 'bg-info text-dark';
                                elseif ($ord['status'] === 'CANCELLED') $badge = 'bg-danger';
                                ?>
                                <span class="badge <?= $badge ?>"><?= htmlspecialchars($ord['status']) ?></span>
                            </td>
                            <td class="p-3 text-end">
                                <form action="orders.php" method="POST" class="d-flex align-items-center justify-content-end gap-1">
                                    <input type="hidden" name="action" value="update_status">
                                    <input type="hidden" name="order_id" value="<?= $ord['id'] ?>">

                                    <select name="status" class="form-select form-select-nexus form-select-sm" style="width: 140px;" onchange="this.form.submit()">
                                        <option value="PENDING" <?= $ord['status'] === 'PENDING' ? 'selected' : '' ?>>PENDING</option>
                                        <option value="PROCESSING" <?= $ord['status'] === 'PROCESSING' ? 'selected' : '' ?>>PROCESSING</option>
                                        <option value="SHIPPED" <?= $ord['status'] === 'SHIPPED' ? 'selected' : '' ?>>SHIPPED</option>
                                        <option value="COMPLETED" <?= $ord['status'] === 'COMPLETED' ? 'selected' : '' ?>>COMPLETED</option>
                                        <option value="CANCELLED" <?= $ord['status'] === 'CANCELLED' ? 'selected' : '' ?>>CANCELLED</option>
                                    </select>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
