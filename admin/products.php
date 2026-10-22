<?php
define('IS_ADMIN_SECTION', true);
require_once __DIR__ . '/../config/auth.php';
require_admin();

$pdo = get_db();
$page_title = 'Gestion de Productos (CRUD)';

// 1. PROCESAR ACCIONES CRUD (Crear, Editar, Eliminar)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // CREAR PRODUCTO (Create)
    if ($action === 'create') {
        $name = trim($_POST['name'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $price = (float)($_POST['price'] ?? 0);
        $compare_price = !empty($_POST['compare_price']) ? (float)$_POST['compare_price'] : null;
        $stock = max(0, (int)($_POST['stock'] ?? 0));
        $sku = strtoupper(trim($_POST['sku'] ?? ''));
        $image_url = trim($_POST['image_url'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $specifications = trim($_POST['specifications'] ?? '');
        $status = in_array($_POST['status'] ?? '', ['ACTIVE', 'DRAFT', 'ARCHIVED']) ? $_POST['status'] : 'ACTIVE';
        $featured = isset($_POST['featured']) ? 1 : 0;

        if (empty($name) || empty($sku) || $price <= 0 || empty($image_url)) {
            set_flash('danger', 'Error de validacion', 'Complete todos los campos obligatorios y asegurese de que el precio sea mayor a cero.');
        } else {
            // Verificar SKU unico
            $sku_check = $pdo->prepare("SELECT id FROM products WHERE sku = ?");
            $sku_check->execute([$sku]);
            if ($sku_check->fetch()) {
                set_flash('danger', 'SKU Duplicado', "El codigo SKU '$sku' ya se encuentra asignado a otro producto.");
            } else {
                // Generar slug
                $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
                $slug_check = $pdo->prepare("SELECT id FROM products WHERE slug = ?");
                $slug_check->execute([$slug]);
                if ($slug_check->fetch()) {
                    $slug .= '-' . rand(100, 999);
                }

                $stmt = $pdo->prepare("
                    INSERT INTO products (
                        name, slug, description, specifications, price, compare_price,
                        stock, sku, image_url, category, featured, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $name, $slug, $description, $specifications, $price, $compare_price,
                    $stock, $sku, $image_url, $category, $featured, $status
                ]);

                set_flash('success', 'Producto registrado', "El equipo '$name' fue dado de alta exitosamente en el catalogo.");
            }
        }
        header('Location: products.php');
        exit;
    }

    // ACTUALIZAR PRODUCTO (Update)
    if ($action === 'update') {
        $id = (int)($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $price = (float)($_POST['price'] ?? 0);
        $compare_price = !empty($_POST['compare_price']) ? (float)$_POST['compare_price'] : null;
        $stock = max(0, (int)($_POST['stock'] ?? 0));
        $sku = strtoupper(trim($_POST['sku'] ?? ''));
        $image_url = trim($_POST['image_url'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $specifications = trim($_POST['specifications'] ?? '');
        $status = in_array($_POST['status'] ?? '', ['ACTIVE', 'DRAFT', 'ARCHIVED']) ? $_POST['status'] : 'ACTIVE';
        $featured = isset($_POST['featured']) ? 1 : 0;

        if ($id <= 0 || empty($name) || empty($sku) || $price <= 0) {
            set_flash('danger', 'Error de actualizacion', 'Campos obligatorios incompletos o invalidos.');
        } else {
            // Verificar colision de SKU con otro id
            $sku_check = $pdo->prepare("SELECT id FROM products WHERE sku = ? AND id != ?");
            $sku_check->execute([$sku, $id]);
            if ($sku_check->fetch()) {
                set_flash('danger', 'SKU en conflicto', "El SKU '$sku' ya pertenece a otro registro.");
            } else {
                $stmt = $pdo->prepare("
                    UPDATE products SET
                        name = ?, description = ?, specifications = ?, price = ?,
                        compare_price = ?, stock = ?, sku = ?, image_url = ?,
                        category = ?, featured = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([
                    $name, $description, $specifications, $price,
                    $compare_price, $stock, $sku, $image_url,
                    $category, $featured, $status, $id
                ]);

                set_flash('success', 'Actualizacion completa', "Se actualizaron los datos tecnicos de '$name'.");
            }
        }
        header('Location: products.php');
        exit;
    }

    // ELIMINAR / ARCHIVAR PRODUCTO (Delete)
    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            // Verificar si posee ordenes historicas
            $chk = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = ?");
            $chk->execute([$id]);
            $has_orders = ((int)$chk->fetchColumn()) > 0;

            if ($has_orders) {
                // Archivado seguro para salvaguardar coherencia contable
                $stmt = $pdo->prepare("UPDATE products SET status = 'ARCHIVED' WHERE id = ?");
                $stmt->execute([$id]);
                set_flash('info', 'Producto archivado', 'El producto posee ordenes historicas registradas. Ha sido archivado en lugar de eliminarse fisicamente para salvaguardar la integridad de datos.');
            } else {
                $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
                $stmt->execute([$id]);
                set_flash('success', 'Producto eliminado', 'El registro fue eliminado definitivamente del sistema.');
            }
        }
        header('Location: products.php');
        exit;
    }
}

// 2. CONSULTA Y LISTADO DE PRODUCTOS (Read)
$search = trim($_GET['q'] ?? '');
$category = trim($_GET['category'] ?? 'ALL');
$where_clauses = ["1=1"];
$params = [];

if ($search !== '') {
    $where_clauses[] = "(name LIKE ? OR sku LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
}

if ($category !== '' && $category !== 'ALL') {
    $where_clauses[] = "category = ?";
    $params[] = $category;
}

$where_sql = implode(' AND ', $where_clauses);

$stmt = $pdo->prepare("SELECT * FROM products WHERE $where_sql ORDER BY id DESC");
$stmt->execute($params);
$products = $stmt->fetchAll();

// Categorias disponibles
$cat_stmt = $pdo->query("SELECT DISTINCT category FROM products ORDER BY category ASC");
$categories = $cat_stmt->fetchAll(PDO::FETCH_COLUMN);

require_once __DIR__ . '/../includes/header.php';
?>

<!-- Cabecera de Gestion -->
<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
    <div>
        <div class="d-flex align-items-center gap-2 text-warning small text-uppercase fw-semibold mb-1">
            <i class="bi bi-boxes"></i> Inventario Central
        </div>
        <h1 class="h2 fw-extrabold text-white mb-0">Gestion de Catalogo (CRUD)</h1>
        <small class="text-muted">Creacion, modificacion, suspension y baja de equipamiento tecnologico.</small>
    </div>

    <div>
        <button type="button" class="btn btn-nexus-primary d-flex align-items-center gap-2 py-2 px-3" data-bs-toggle="modal" data-bs-target="#createProductModal">
            <i class="bi bi-plus-lg fs-6"></i>
            <span>Nuevo Producto</span>
        </button>
    </div>
</div>

<!-- Filtros de Busqueda en Administracion -->
<div class="card card-nexus p-3 mb-4">
    <form method="GET" action="products.php" class="row g-3 align-items-center">
        <div class="col-md-6">
            <div class="input-group">
                <span class="input-group-text bg-dark border-secondary text-muted">
                    <i class="bi bi-search"></i>
                </span>
                <input type="text" name="q" class="form-control form-control-nexus" placeholder="Buscar por nombre o SKU..." value="<?= htmlspecialchars($search) ?>">
            </div>
        </div>

        <div class="col-md-4">
            <select name="category" class="form-select form-select-nexus" onchange="this.form.submit()">
                <option value="ALL">Todas las Categorias</option>
                <?php foreach ($categories as $c): ?>
                    <option value="<?= htmlspecialchars($c) ?>" <?= $category === $c ? 'selected' : '' ?>>
                        <?= htmlspecialchars($c) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn btn-nexus-primary flex-fill">Filtrar</button>
            <a href="products.php" class="btn btn-nexus-outline" title="Limpiar"><i class="bi bi-arrow-counterclockwise"></i></a>
        </div>
    </form>
</div>

<!-- Tabla de Productos con Acciones de Modificacion y Baja -->
<div class="card card-nexus overflow-hidden mb-5">
    <div class="table-responsive">
        <table class="table table-dark table-hover align-middle mb-0 text-start small">
            <thead class="border-secondary text-muted text-uppercase">
                <tr>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Categoria</th>
                    <th class="p-3">SKU</th>
                    <th class="p-3">Precio</th>
                    <th class="p-3">Stock</th>
                    <th class="p-3">Estado</th>
                    <th class="p-3 text-end" style="width: 120px;">Acciones</th>
                </tr>
            </thead>
            <tbody class="divide-secondary">
                <?php if (empty($products)): ?>
                    <tr>
                        <td colspan="7" class="p-4 text-center text-muted">No se encontraron productos registrados con los criterios solicitados.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($products as $p): ?>
                        <tr>
                            <td class="p-3">
                                <div class="d-flex align-items-center gap-3">
                                    <img src="<?= htmlspecialchars($p['image_url']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">
                                    <div>
                                        <span class="fw-bold text-white d-block"><?= htmlspecialchars($p['name']) ?></span>
                                        <small class="text-muted d-block text-truncate" style="max-width: 250px;"><?= htmlspecialchars($p['description']) ?></small>
                                    </div>
                                </div>
                            </td>
                            <td class="p-3 text-light"><?= htmlspecialchars($p['category']) ?></td>
                            <td class="p-3 font-monospace text-muted"><?= htmlspecialchars($p['sku']) ?></td>
                            <td class="p-3 text-white fw-bold"><?= format_currency((float)$p['price']) ?></td>
                            <td class="p-3">
                                <?php if ($p['stock'] <= 0): ?>
                                    <span class="badge bg-danger">Agotado (0)</span>
                                <?php elseif ($p['stock'] <= 5): ?>
                                    <span class="badge bg-warning text-dark"><?= $p['stock'] ?> un. (Critico)</span>
                                <?php else: ?>
                                    <span class="badge bg-success"><?= $p['stock'] ?> un.</span>
                                <?php endif; ?>
                            </td>
                            <td class="p-3">
                                <span class="badge <?= $p['status'] === 'ACTIVE' ? 'bg-primary' : ($p['status'] === 'DRAFT' ? 'bg-secondary' : 'bg-danger') ?>">
                                    <?= htmlspecialchars($p['status']) ?>
                                </span>
                            </td>
                            <td class="p-3 text-end">
                                <div class="d-flex justify-content-end gap-1">
                                    <!-- Boton Editar -->
                                    <button type="button" 
                                            class="btn btn-nexus-outline btn-sm py-1 px-2 btn-edit-product"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editProductModal"
                                            data-product='<?= htmlspecialchars(json_encode($p), ENT_QUOTES, 'UTF-8') ?>'
                                            title="Editar producto">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>

                                    <!-- Boton Eliminar -->
                                    <button type="button" 
                                            class="btn btn-outline-danger btn-sm py-1 px-2 btn-delete-product"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#deleteProductModal"
                                            data-id="<?= $p['id'] ?>"
                                            data-name="<?= htmlspecialchars($p['name']) ?>"
                                            title="Dar de baja / eliminar">
                                        <i class="bi bi-trash3"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- MODAL: REGISTRAR PRODUCTO (Create) -->
<div class="modal fade" id="createProductModal" tabindex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title text-white fw-bold" id="createModalLabel">
                    <i class="bi bi-plus-circle me-1 text-primary"></i>Registrar Nuevo Producto
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form action="products.php" method="POST">
                <input type="hidden" name="action" value="create">
                
                <div class="modal-body p-4 small">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-muted">Nombre del Producto *</label>
                            <input type="text" name="name" required class="form-control form-control-nexus" placeholder="Ej. Servidor Rack Nexus PowerEdge R750">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Categoria *</label>
                            <select name="category" class="form-select form-select-nexus" required>
                                <option value="Servidores y Redes">Servidores y Redes</option>
                                <option value="Estaciones de Trabajo">Estaciones de Trabajo</option>
                                <option value="Almacenamiento Empresarial">Almacenamiento Empresarial</option>
                                <option value="Ciberseguridad y Perifericos">Ciberseguridad y Perifericos</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Precio Unitario (USD) *</label>
                            <input type="number" step="0.01" min="0.01" name="price" required class="form-control form-control-nexus" placeholder="4899.99">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Precio Anterior (Opcional)</label>
                            <input type="number" step="0.01" min="0" name="compare_price" class="form-control form-control-nexus" placeholder="5399.99">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Stock Disponible *</label>
                            <input type="number" min="0" name="stock" required class="form-control form-control-nexus" placeholder="10">
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Codigo SKU Unico *</label>
                            <input type="text" name="sku" required class="form-control form-control-nexus font-monospace text-uppercase" placeholder="SRV-NX-750">
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-muted">URL de Imagen del Producto *</label>
                            <input type="url" name="image_url" required class="form-control form-control-nexus" placeholder="https://images.unsplash.com/photo-...">
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-muted">Descripcion General *</label>
                            <textarea name="description" required rows="3" class="form-control form-control-nexus" placeholder="Detalle tecnico, arquitectura de procesadores y casos de aplicacion..."></textarea>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-muted">Especificaciones de Hardware (Opcional)</label>
                            <textarea name="specifications" rows="3" class="form-control form-control-nexus font-monospace" placeholder="Procesador: Dual Intel Xeon Gold&#10;RAM: 128GB ECC DDR4&#10;Almacenamiento: 4x 1TB NVMe Enterprise"></textarea>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-muted">Estado Inicial</label>
                            <select name="status" class="form-select form-select-nexus">
                                <option value="ACTIVE">Activo en Catalogo</option>
                                <option value="DRAFT">Borrador</option>
                                <option value="ARCHIVED">Archivado</option>
                            </select>
                        </div>

                        <div class="col-md-6 d-flex align-items-center pt-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="featured" id="createFeatured">
                                <label class="form-check-label text-light fw-bold" for="createFeatured">
                                    Destacar producto en la pagina de inicio
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-nexus-outline" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-nexus-primary">
                        <i class="bi bi-check-lg me-1"></i>Guardar en Catalogo
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL: EDITAR PRODUCTO (Update) -->
<div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title text-white fw-bold" id="editModalLabel">
                    <i class="bi bi-pencil-square me-1 text-warning"></i>Modificar Datos del Producto
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form action="products.php" method="POST">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" id="edit-id">

                <div class="modal-body p-4 small">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-muted">Nombre del Producto *</label>
                            <input type="text" name="name" id="edit-name" required class="form-control form-control-nexus">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Categoria *</label>
                            <select name="category" id="edit-category" class="form-select form-select-nexus" required>
                                <option value="Servidores y Redes">Servidores y Redes</option>
                                <option value="Estaciones de Trabajo">Estaciones de Trabajo</option>
                                <option value="Almacenamiento Empresarial">Almacenamiento Empresarial</option>
                                <option value="Ciberseguridad y Perifericos">Ciberseguridad y Perifericos</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Precio Unitario (USD) *</label>
                            <input type="number" step="0.01" min="0.01" name="price" id="edit-price" required class="form-control form-control-nexus">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Precio Anterior</label>
                            <input type="number" step="0.01" min="0" name="compare_price" id="edit-compare-price" class="form-control form-control-nexus">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Stock Disponible *</label>
                            <input type="number" min="0" name="stock" id="edit-stock" required class="form-control form-control-nexus">
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted">Codigo SKU *</label>
                            <input type="text" name="sku" id="edit-sku" required class="form-control form-control-nexus font-monospace text-uppercase">
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-muted">URL de Imagen *</label>
                            <input type="url" name="image_url" id="edit-image-url" required class="form-control form-control-nexus">
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-muted">Descripcion General *</label>
                            <textarea name="description" id="edit-description" required rows="3" class="form-control form-control-nexus"></textarea>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-muted">Especificaciones de Hardware</label>
                            <textarea name="specifications" id="edit-specifications" rows="3" class="form-control form-control-nexus font-monospace"></textarea>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-muted">Estado del Producto</label>
                            <select name="status" id="edit-status" class="form-select form-select-nexus">
                                <option value="ACTIVE">Activo en Catalogo</option>
                                <option value="DRAFT">Borrador</option>
                                <option value="ARCHIVED">Archivado</option>
                            </select>
                        </div>

                        <div class="col-md-6 d-flex align-items-center pt-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="featured" id="edit-featured">
                                <label class="form-check-label text-light fw-bold" for="edit-featured">
                                    Destacar producto en la pagina de inicio
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-nexus-outline" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-nexus-primary">
                        <i class="bi bi-check-lg me-1"></i>Actualizar Registro
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- MODAL: CONFIRMAR ELIMINACION / BAJA (Delete) -->
<div class="modal fade" id="deleteProductModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title text-white fw-bold" id="deleteModalLabel">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>Confirmar Eliminacion
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form action="products.php" method="POST">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" id="delete-id">

                <div class="modal-body p-4 text-start small">
                    <p class="text-white mb-2">
                        Esta seguro de que desea eliminar o dar de baja el siguiente producto?
                    </p>
                    <div class="p-2.5 rounded bg-black border border-secondary text-light fw-bold mb-3" id="delete-name-display"></div>
                    <p class="text-muted small mb-0">
                        Si este producto posee transacciones u ordenes historicas vinculadas, sera archivado automaticamente para preservar la coherencia contable y auditoria.
                    </p>
                </div>

                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-nexus-outline" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-danger">
                        <i class="bi bi-trash3 me-1"></i>Confirmar Accion
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Precarga de datos en los modales de edicion y eliminacion
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', function () {
            const data = JSON.parse(this.dataset.product);
            document.getElementById('edit-id').value = data.id;
            document.getElementById('edit-name').value = data.name;
            document.getElementById('edit-category').value = data.category;
            document.getElementById('edit-price').value = data.price;
            document.getElementById('edit-compare-price').value = data.compare_price || '';
            document.getElementById('edit-stock').value = data.stock;
            document.getElementById('edit-sku').value = data.sku;
            document.getElementById('edit-image-url').value = data.image_url;
            document.getElementById('edit-description').value = data.description;
            document.getElementById('edit-specifications').value = data.specifications || '';
            document.getElementById('edit-status').value = data.status;
            document.getElementById('edit-featured').checked = parseInt(data.featured, 10) === 1;
        });
    });

    document.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('delete-id').value = this.dataset.id;
            document.getElementById('delete-name-display').textContent = this.dataset.name;
        });
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
