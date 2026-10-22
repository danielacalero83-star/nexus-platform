<?php
require_once __DIR__ . '/config/auth.php';
$pdo = get_db();

$page_title = 'Catalogo Corporativo de Equipamiento';

// Captura y sanitizacion de parametros de busqueda y filtros (RF-03)
$search = trim($_GET['q'] ?? '');
$category = trim($_GET['category'] ?? 'ALL');
$min_price = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? (float)$_GET['min_price'] : null;
$max_price = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? (float)$_GET['max_price'] : null;
$in_stock = isset($_GET['in_stock']) && $_GET['in_stock'] === '1';
$sort = trim($_GET['sort'] ?? 'newest');
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 12;
$offset = ($page - 1) * $limit;

// Construccion de la consulta SQL con sentencias preparadas (PDO)
$where_clauses = ["status = 'ACTIVE'"];
$params = [];

if ($search !== '') {
    $where_clauses[] = "(name LIKE ? OR description LIKE ? OR sku LIKE ? OR category LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

if ($category !== '' && $category !== 'ALL') {
    $where_clauses[] = "category = ?";
    $params[] = $category;
}

if ($min_price !== null) {
    $where_clauses[] = "price >= ?";
    $params[] = $min_price;
}

if ($max_price !== null) {
    $where_clauses[] = "price <= ?";
    $params[] = $max_price;
}

if ($in_stock) {
    $where_clauses[] = "stock > 0";
}

$where_sql = implode(' AND ', $where_clauses);

// Definicion de ordenamiento
switch ($sort) {
    case 'price_asc':
        $order_sql = 'price ASC';
        break;
    case 'price_desc':
        $order_sql = 'price DESC';
        break;
    case 'rating':
        $order_sql = 'rating DESC, review_count DESC';
        break;
    case 'name_asc':
        $order_sql = 'name ASC';
        break;
    case 'name_desc':
        $order_sql = 'name DESC';
        break;
    case 'newest':
    default:
        $order_sql = 'id DESC';
        break;
}

// Conteo total para paginacion
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE $where_sql");
$count_stmt->execute($params);
$total_products = (int)$count_stmt->fetchColumn();
$total_pages = max(1, ceil($total_products / $limit));

// Consulta de productos
$stmt = $pdo->prepare("SELECT * FROM products WHERE $where_sql ORDER BY $order_sql LIMIT $limit OFFSET $offset");
$stmt->execute($params);
$products = $stmt->fetchAll();

// Categorias disponibles para el filtro
$cat_stmt = $pdo->query("SELECT DISTINCT category FROM products WHERE status = 'ACTIVE' ORDER BY category ASC");
$categories = $cat_stmt->fetchAll(PDO::FETCH_COLUMN);

require_once __DIR__ . '/includes/header.php';
?>

<!-- Encabezado de la Pagina -->
<div class="mb-4">
    <div class="d-flex align-items-center gap-2 text-primary small text-uppercase fw-semibold mb-1" style="letter-spacing: 1px;">
        <i class="bi bi-grid-fill"></i> Catalogo Corporativo
    </div>
    <h1 class="h2 fw-extrabold text-white mb-1">Equipamiento e Infraestructura IT</h1>
    <p class="text-muted small">Filtre, ordene y compare servidores, workstations y dispositivos con inventario verificado en tiempo real.</p>
</div>

<!-- Barra de Filtros y Busqueda (RF-03) -->
<div class="card card-nexus p-3 mb-4">
    <form method="GET" action="products.php" id="filtersForm">
        <div class="row g-3">
            <!-- Buscador por palabra clave -->
            <div class="col-lg-4">
                <label class="form-label small fw-bold text-muted mb-1">Buscar Producto</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-muted">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" name="q" class="form-control form-control-nexus" placeholder="Nombre, SKU o descripcion..." value="<?= htmlspecialchars($search) ?>">
                </div>
            </div>

            <!-- Filtro de Categoria -->
            <div class="col-sm-6 col-lg-2">
                <label class="form-label small fw-bold text-muted mb-1">Categoria</label>
                <select name="category" class="form-select form-select-nexus">
                    <option value="ALL">Todas</option>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= htmlspecialchars($cat) ?>" <?= $category === $cat ? 'selected' : '' ?>>
                            <?= htmlspecialchars($cat) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Filtro de Rango de Precios -->
            <div class="col-sm-6 col-lg-3">
                <label class="form-label small fw-bold text-muted mb-1">Rango de Precio (USD)</label>
                <div class="d-flex align-items-center gap-1">
                    <input type="number" step="0.01" min="0" name="min_price" class="form-control form-control-nexus" placeholder="Min" value="<?= $min_price !== null ? htmlspecialchars((string)$min_price) : '' ?>">
                    <span class="text-muted">-</span>
                    <input type="number" step="0.01" min="0" name="max_price" class="form-control form-control-nexus" placeholder="Max" value="<?= $max_price !== null ? htmlspecialchars((string)$max_price) : '' ?>">
                </div>
            </div>

            <!-- Criterio de Ordenamiento -->
            <div class="col-sm-6 col-lg-2">
                <label class="form-label small fw-bold text-muted mb-1">Ordenar por</label>
                <select name="sort" class="form-select form-select-nexus">
                    <option value="newest" <?= $sort === 'newest' ? 'selected' : '' ?>>Mas recientes</option>
                    <option value="price_asc" <?= $sort === 'price_asc' ? 'selected' : '' ?>>Precio: Menor a Mayor</option>
                    <option value="price_desc" <?= $sort === 'price_desc' ? 'selected' : '' ?>>Precio: Mayor a Menor</option>
                    <option value="rating" <?= $sort === 'rating' ? 'selected' : '' ?>>Mejor calificados</option>
                    <option value="name_asc" <?= $sort === 'name_asc' ? 'selected' : '' ?>>Nombre A - Z</option>
                    <option value="name_desc" <?= $sort === 'name_desc' ? 'selected' : '' ?>>Nombre Z - A</option>
                </select>
            </div>

            <!-- Disponibilidad y Botones -->
            <div class="col-sm-6 col-lg-1 d-flex flex-column justify-content-end">
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" name="in_stock" value="1" id="inStockCheck" <?= $in_stock ? 'checked' : '' ?>>
                    <label class="form-check-label small text-muted text-nowrap" for="inStockCheck">
                        En stock
                    </label>
                </div>
                <div class="d-flex gap-1">
                    <button type="submit" class="btn btn-nexus-primary btn-sm flex-fill" title="Aplicar filtros">
                        <i class="bi bi-filter"></i>
                    </button>
                    <a href="products.php" class="btn btn-nexus-outline btn-sm" title="Restablecer filtros">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </a>
                </div>
            </div>
        </div>
    </form>
</div>

<!-- Resumen de Resultados -->
<div class="d-flex justify-content-between align-items-center mb-3 text-muted small">
    <div>
        Mostrando <strong><?= count($products) ?></strong> de <strong><?= $total_products ?></strong> productos encontrados
    </div>
    <?php if ($category !== 'ALL'): ?>
        <span class="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">
            Filtrado: <?= htmlspecialchars($category) ?>
        </span>
    <?php endif; ?>
</div>

<!-- Grid de Productos -->
<?php if (empty($products)): ?>
    <div class="card card-nexus p-5 text-center my-4">
        <div class="mx-auto mb-3 p-3 rounded-circle bg-dark border border-secondary text-muted" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
            <i class="bi bi-box-seam fs-1"></i>
        </div>
        <h4 class="fw-bold text-white mb-2">No se encontraron productos</h4>
        <p class="text-muted small mx-auto mb-3" style="max-w: 400px;">
            No existen registros que coincidan con los parametros de busqueda, categoria o rango de precios ingresados.
        </p>
        <div>
            <a href="products.php" class="btn btn-nexus-primary btn-sm py-2 px-3">
                <i class="bi bi-arrow-clockwise me-1"></i>Limpiar todos los filtros
            </a>
        </div>
    </div>
<?php else: ?>
    <div class="row g-4 mb-5">
        <?php foreach ($products as $prod): ?>
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="card card-nexus h-100 d-flex flex-column">
                    <div class="position-relative">
                        <img src="<?= htmlspecialchars($prod['image_url']) ?>" class="card-nexus-img w-100" alt="<?= htmlspecialchars($prod['name']) ?>">
                        <span class="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 border border-secondary text-light">
                            <?= htmlspecialchars($prod['category']) ?>
                        </span>
                        <?php if ($prod['stock'] <= 0): ?>
                            <span class="position-absolute top-0 end-0 m-3 badge bg-danger">Agotado</span>
                        <?php elseif ($prod['stock'] <= 5): ?>
                            <span class="position-absolute top-0 end-0 m-3 badge bg-warning text-dark">
                                <i class="bi bi-exclamation-triangle me-1"></i><?= $prod['stock'] ?> un.
                            </span>
                        <?php else: ?>
                            <span class="position-absolute top-0 end-0 m-3 badge bg-success">En Stock</span>
                        <?php endif; ?>
                    </div>

                    <div class="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
                                <span class="font-monospace">SKU: <?= htmlspecialchars($prod['sku']) ?></span>
                                <div class="text-warning d-flex align-items-center gap-1">
                                    <i class="bi bi-star-fill"></i>
                                    <span class="fw-bold text-light"><?= number_format($prod['rating'], 1) ?></span>
                                    <span class="text-muted">(<?= $prod['review_count'] ?>)</span>
                                </div>
                            </div>

                            <h5 class="card-title fw-bold text-white fs-6 mb-2">
                                <a href="product-detail.php?id=<?= $prod['id'] ?>" class="text-white text-decoration-none hover-primary">
                                    <?= htmlspecialchars($prod['name']) ?>
                                </a>
                            </h5>

                            <p class="card-text text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                <?= htmlspecialchars($prod['description']) ?>
                            </p>
                        </div>

                        <div class="pt-3 border-top border-secondary-subtle d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fs-5 fw-extrabold text-white d-block"><?= format_currency((float)$prod['price']) ?></span>
                                <?php if (!empty($prod['compare_price']) && $prod['compare_price'] > $prod['price']): ?>
                                    <small class="text-muted text-decoration-line-through"><?= format_currency((float)$prod['compare_price']) ?></small>
                                <?php endif; ?>
                            </div>

                            <div class="d-flex gap-1">
                                <a href="product-detail.php?id=<?= $prod['id'] ?>" class="btn btn-nexus-outline btn-sm py-2 px-2.5" title="Ver ficha tecnica">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <button type="button" 
                                        class="btn btn-nexus-primary btn-sm py-2 px-3 btn-add-to-cart d-flex align-items-center gap-1"
                                        data-product-id="<?= $prod['id'] ?>"
                                        <?= $prod['stock'] <= 0 ? 'disabled' : '' ?>>
                                    <i class="bi bi-cart-plus"></i>
                                    <span>Agregar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Paginacion -->
    <?php if ($total_pages > 1): ?>
        <nav aria-label="Navegacion de paginas del catalogo" class="mb-5">
            <ul class="pagination justify-content-center">
                <li class="page-item <?= $page <= 1 ? 'disabled' : '' ?>">
                    <a class="page-link bg-dark border-secondary text-light" href="?<?= http_build_query(array_merge($_GET, ['page' => $page - 1])) ?>">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                    <li class="page-item <?= $page === $i ? 'active' : '' ?>">
                        <a class="page-link <?= $page === $i ? 'bg-primary border-primary text-white' : 'bg-dark border-secondary text-light' ?>" href="?<?= http_build_query(array_merge($_GET, ['page' => $i])) ?>">
                            <?= $i ?>
                        </a>
                    </li>
                <?php endfor; ?>
                <li class="page-item <?= $page >= $total_pages ? 'disabled' : '' ?>">
                    <a class="page-link bg-dark border-secondary text-light" href="?<?= http_build_query(array_merge($_GET, ['page' => $page + 1])) ?>">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    <?php endif; ?>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
