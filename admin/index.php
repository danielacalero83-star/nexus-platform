<?php
define('IS_ADMIN_SECTION', true);
require_once __DIR__ . '/../config/auth.php';
require_admin();

$pdo = get_db();
$page_title = 'Panel de Administracion y Metricas';

// Consultas de Metricas y KPIs (RF-02)
$rev_stmt = $pdo->query("SELECT SUM(total) as revenue FROM orders");
$total_revenue = (float)($rev_stmt->fetchColumn() ?: 0);

$ord_stmt = $pdo->query("SELECT COUNT(*) FROM orders");
$total_orders = (int)$ord_stmt->fetchColumn();

$prod_stmt = $pdo->query("SELECT COUNT(*) FROM products WHERE status = 'ACTIVE'");
$total_products = (int)$prod_stmt->fetchColumn();

$low_stmt = $pdo->query("SELECT COUNT(*) FROM products WHERE stock <= 5 AND status = 'ACTIVE'");
$low_stock_count = (int)$low_stmt->fetchColumn();

$usr_stmt = $pdo->query("SELECT COUNT(*) FROM users");
$total_users = (int)$usr_stmt->fetchColumn();

// Ultimas 5 ordenes
$recent_stmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC LIMIT 5");
$recent_orders = $recent_stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<!-- Cabecera de Seccion Administrativa -->
<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
    <div>
        <div class="d-flex align-items-center gap-2 text-warning small text-uppercase fw-semibold mb-1">
            <i class="bi bi-shield-shaded"></i> Modulo Administrativo
        </div>
        <h1 class="h2 fw-extrabold text-white mb-0">Panel de Control e Indicadores</h1>
        <small class="text-muted">Resumen ejecutivo de facturacion, rotacion de inventario y estado operativo.</small>
    </div>

    <div class="d-flex gap-2">
        <a href="products.php" class="btn btn-nexus-primary d-flex align-items-center gap-2 btn-sm py-2 px-3">
            <i class="bi bi-boxes"></i>
            <span>Gestion de Catalogo (CRUD)</span>
        </a>
        <a href="orders.php" class="btn btn-nexus-outline d-flex align-items-center gap-2 btn-sm py-2 px-3">
            <i class="bi bi-receipt"></i>
            <span>Ver Todas las Ordenes</span>
        </a>
    </div>
</div>

<!-- Tarjetas de Metricas / KPIs -->
<div class="row g-4 mb-4">
    <div class="col-sm-6 col-xl-3">
        <div class="card card-nexus p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Facturacion Bruta</span>
                <div class="p-2 rounded-2 bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    <i class="bi bi-currency-dollar fs-5"></i>
                </div>
            </div>
            <h3 class="fw-extrabold text-white mb-1"><?= format_currency($total_revenue) ?></h3>
            <small class="text-muted">Ingresos totales liquidados</small>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card card-nexus p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Ordenes Totales</span>
                <div class="p-2 rounded-2 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                    <i class="bi bi-cart-check fs-5"></i>
                </div>
            </div>
            <h3 class="fw-extrabold text-white mb-1"><?= $total_orders ?></h3>
            <small class="text-muted">Transacciones procesadas</small>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card card-nexus p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Items en Catalogo</span>
                <div class="p-2 rounded-2 bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                    <i class="bi bi-box-seam fs-5"></i>
                </div>
            </div>
            <h3 class="fw-extrabold text-white mb-1"><?= $total_products ?></h3>
            <small class="text-muted">Equipos activos publicados</small>
        </div>
    </div>

    <div class="col-sm-6 col-xl-3">
        <div class="card card-nexus p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small text-uppercase fw-bold">Stock Critico</span>
                <div class="p-2 rounded-2 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                    <i class="bi bi-exclamation-triangle fs-5"></i>
                </div>
            </div>
            <h3 class="fw-extrabold text-warning mb-1"><?= $low_stock_count ?></h3>
            <small class="text-muted">Equipos con 5 o menos unidades</small>
        </div>
    </div>
</div>

<!-- Tabla de Ordenes Recientes -->
<div class="card card-nexus mb-5">
    <div class="card-header bg-dark border-secondary p-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold text-white mb-0 small text-uppercase">
            <i class="bi bi-clock-history me-1 text-primary"></i>Ultimos Pedidos Registrados
        </h5>
        <a href="orders.php" class="btn btn-nexus-outline btn-sm py-1 px-2.5">Ver Todo</a>
    </div>

    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle mb-0 text-start small">
            <thead class="border-secondary text-muted text-uppercase">
                <tr>
                    <th class="p-3">Correlativo</th>
                    <th class="p-3">Cliente</th>
                    <th class="p-3">Fecha</th>
                    <th class="p-3">Monto Total</th>
                    <th class="p-3">Estado</th>
                    <th class="p-3 text-end">Accion</th>
                </tr>
            </thead>
            <tbody class="divide-secondary">
                <?php if (empty($recent_orders)): ?>
                    <tr>
                        <td colspan="6" class="p-4 text-center text-muted">No se registran transacciones recientes.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($recent_orders as $ro): ?>
                        <tr>
                            <td class="p-3 font-monospace fw-bold text-white"><?= htmlspecialchars($ro['order_number']) ?></td>
                            <td class="p-3">
                                <span class="d-block fw-semibold text-white"><?= htmlspecialchars($ro['customer_name']) ?></span>
                                <small class="text-muted"><?= htmlspecialchars($ro['customer_email']) ?></small>
                            </td>
                            <td class="p-3 text-muted"><?= format_date($ro['created_at']) ?></td>
                            <td class="p-3 text-primary fw-bold"><?= format_currency((float)$ro['total']) ?></td>
                            <td class="p-3">
                                <?php
                                $badge = 'bg-secondary';
                                if ($ro['status'] === 'COMPLETED') $badge = 'bg-success';
                                elseif ($ro['status'] === 'PROCESSING') $badge = 'bg-warning text-dark';
                                elseif ($ro['status'] === 'SHIPPED') $badge = 'bg-info text-dark';
                                elseif ($ro['status'] === 'CANCELLED') $badge = 'bg-danger';
                                ?>
                                <span class="badge <?= $badge ?>"><?= htmlspecialchars($ro['status']) ?></span>
                            </td>
                            <td class="p-3 text-end">
                                <a href="orders.php" class="btn btn-nexus-outline btn-sm py-1 px-2">Detalles</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
