<?php
require_once __DIR__ . '/config/auth.php';
$pdo = get_db();

$product_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($product_id <= 0) {
    header('Location: products.php');
    exit;
}

// Procesar formulario de nueva valoracion (RF-04)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_review') {
    if (!is_logged_in()) {
        set_flash('danger', 'Autenticacion requerida', 'Debe iniciar sesion para publicar una calificacion tecnica.');
        header('Location: login.php?redirect=' . urlencode("product-detail.php?id=$product_id"));
        exit;
    }

    $rating = max(1, min(5, (int)($_POST['rating'] ?? 5)));
    $title = trim($_POST['title'] ?? '');
    $comment = trim($_POST['comment'] ?? '');
    $user = current_user();

    if (strlen($title) < 3 || strlen($comment) < 10) {
        set_flash('warning', 'Campos incompletos', 'El titulo debe contener al menos 3 caracteres y el comentario al menos 10.');
    } else {
        try {
            $pdo->beginTransaction();

            $rev_stmt = $pdo->prepare("INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)");
            $rev_stmt->execute([$product_id, $user['id'], $user['name'], $rating, $title, $comment]);

            // Recalculo atomico de promedio
            $avg_stmt = $pdo->prepare("SELECT AVG(rating) as avg_score, COUNT(*) as total_count FROM reviews WHERE product_id = ?");
            $avg_stmt->execute([$product_id]);
            $stats = $avg_stmt->fetch();

            $new_avg = round((float)$stats['avg_score'], 1);
            $new_count = (int)$stats['total_count'];

            $up_stmt = $pdo->prepare("UPDATE products SET rating = ?, review_count = ? WHERE id = ?");
            $up_stmt->execute([$new_avg, $new_count, $product_id]);

            $pdo->commit();
            set_flash('success', 'Valoracion registrada', 'Gracias por compartir su analisis tecnico sobre este equipamiento.');
        } catch (Exception $e) {
            $pdo->rollBack();
            set_flash('danger', 'Error al procesar', 'No fue posible registrar la valoracion en la base de datos.');
        }
    }

    header("Location: product-detail.php?id=$product_id#reviews-section");
    exit;
}

// Obtener datos del producto
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$product_id]);
$product = $stmt->fetch();

if (!$product) {
    header('Location: products.php');
    exit;
}

$page_title = $product['name'];

// Obtener resenas del producto
$rev_stmt = $pdo->prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC");
$rev_stmt->execute([$product_id]);
$reviews = $rev_stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<!-- Migas de Pan (Breadcrumbs) -->
<nav aria-label="breadcrumb" class="mb-4">
    <ol class="breadcrumb small">
        <li class="breadcrumb-item"><a href="index.php" class="text-muted text-decoration-none">Inicio</a></li>
        <li class="breadcrumb-item"><a href="products.php" class="text-muted text-decoration-none">Catalogo</a></li>
        <li class="breadcrumb-item"><a href="products.php?category=<?= urlencode($product['category']) ?>" class="text-muted text-decoration-none"><?= htmlspecialchars($product['category']) ?></a></li>
        <li class="breadcrumb-item active text-light" aria-current="page"><?= htmlspecialchars($product['name']) ?></li>
    </ol>
</nav>

<!-- Ficha Principal del Producto -->
<div class="row g-4 mb-5 align-items-start">
    <!-- Fotografia del Producto -->
    <div class="col-lg-6">
        <div class="card card-nexus p-3 overflow-hidden text-center">
            <img src="<?= htmlspecialchars($product['image_url']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" class="img-fluid rounded-3" style="max-height: 480px; object-fit: cover; width: 100%;">
        </div>
    </div>

    <!-- Informacion Comercial y Acciones -->
    <div class="col-lg-6">
        <div class="card card-nexus p-4">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                    <?= htmlspecialchars($product['category']) ?>
                </span>
                <span class="font-monospace text-muted small">SKU: <?= htmlspecialchars($product['sku']) ?></span>
            </div>

            <h1 class="h3 fw-bold text-white mb-3"><?= htmlspecialchars($product['name']) ?></h1>

            <!-- Puntuacion y Existencias -->
            <div class="d-flex flex-wrap justify-content-between align-items-center py-2 mb-3 border-top border-bottom border-secondary-subtle">
                <div class="d-flex align-items-center gap-2">
                    <div class="text-warning d-flex align-items-center gap-1">
                        <i class="bi bi-star-fill"></i>
                        <span class="fw-bold text-white fs-6"><?= number_format($product['rating'], 1) ?></span>
                    </div>
                    <a href="#reviews-section" class="text-muted small text-decoration-none">
                        (<?= $product['review_count'] ?> valoraciones)
                    </a>
                </div>

                <div>
                    <?php if ($product['stock'] <= 0): ?>
                        <span class="badge bg-danger px-3 py-2">Sin existencias para entrega inmediata</span>
                    <?php elseif ($product['stock'] <= 5): ?>
                        <span class="badge bg-warning text-dark px-3 py-2">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i>Inventario critico: solo <?= $product['stock'] ?> un.
                        </span>
                    <?php else: ?>
                        <span class="badge bg-success px-3 py-2">
                            <i class="bi bi-check-circle-fill me-1"></i>Disponible para despacho (<?= $product['stock'] ?> un.)
                        </span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Precio -->
            <div class="mb-3">
                <div class="d-flex align-items-baseline gap-3">
                    <span class="display-6 fw-extrabold text-white"><?= format_currency((float)$product['price']) ?></span>
                    <?php if (!empty($product['compare_price']) && $product['compare_price'] > $product['price']): ?>
                        <span class="fs-5 text-muted text-decoration-line-through"><?= format_currency((float)$product['compare_price']) ?></span>
                    <?php endif; ?>
                </div>
                <small class="text-muted">Precios no incluyen IVA aplicable</small>
            </div>

            <!-- Descripcion General -->
            <div class="mb-4">
                <h6 class="text-muted text-uppercase fw-bold fs-7 mb-2">Descripcion General</h6>
                <p class="text-light small leading-relaxed"><?= htmlspecialchars($product['description']) ?></p>
            </div>

            <!-- Especificaciones Tecnicas -->
            <?php if (!empty($product['specifications'])): ?>
                <div class="p-3 rounded-3 bg-dark border border-secondary mb-4">
                    <h6 class="text-white fw-bold small text-uppercase mb-2"><i class="bi bi-gear-fill me-1 text-primary"></i>Especificaciones de Fabrica</h6>
                    <pre class="text-muted font-monospace small mb-0" style="white-space: pre-wrap; font-size: 0.8rem;"><?= htmlspecialchars($product['specifications']) ?></pre>
                </div>
            <?php endif; ?>

            <!-- Modulo Interactivo de Compra (RF-04) -->
            <form action="cart.php" method="POST" class="pt-2 border-top border-secondary-subtle">
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">

                <div class="row g-3 align-items-center mb-3">
                    <div class="col-sm-4">
                        <label class="form-label small text-muted fw-bold mb-1">Cantidad:</label>
                        <input type="number" 
                               name="quantity" 
                               id="product-quantity-<?= $product['id'] ?>"
                               class="form-control form-control-nexus text-center fw-bold" 
                               value="1" 
                               min="1" 
                               max="<?= max(1, $product['stock']) ?>"
                               <?= $product['stock'] <= 0 ? 'disabled' : '' ?>>
                    </div>
                    <div class="col-sm-8 d-flex align-items-end">
                        <small class="text-muted">Maximo <?= $product['stock'] ?> unidades disponibles</small>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-2">
                    <button type="button" 
                            class="btn btn-nexus-outline py-2.5 px-4 flex-fill btn-add-to-cart d-flex align-items-center justify-content-center gap-2"
                            data-product-id="<?= $product['id'] ?>"
                            <?= $product['stock'] <= 0 ? 'disabled' : '' ?>>
                        <i class="bi bi-cart-plus fs-5"></i>
                        <span>Agregar al Carrito</span>
                    </button>

                    <button type="submit" 
                            name="buy_now" 
                            value="1" 
                            class="btn btn-nexus-primary py-2.5 px-4 flex-fill d-flex align-items-center justify-content-center gap-2"
                            <?= $product['stock'] <= 0 ? 'disabled' : '' ?>>
                        <span>Comprar Ahora</span>
                        <i class="bi bi-arrow-right fs-5"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modulo Interactivo de Resenas y Calificaciones (RF-04) -->
<section id="reviews-section" class="card card-nexus p-4 p-lg-5 mb-5">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom border-secondary-subtle">
        <div>
            <div class="d-flex align-items-center gap-2 text-primary small text-uppercase fw-semibold mb-1">
                <i class="bi bi-chat-square-text-fill"></i> Evaluacion Tecnica
            </div>
            <h3 class="fw-bold text-white mb-0">Valoraciones de Ingenieria y Clientes</h3>
            <small class="text-muted">Desempeno observado, fiabilidad y cumplimiento de carga en produccion.</small>
        </div>

        <div class="d-flex align-items-center gap-4">
            <div class="text-md-end">
                <div class="d-flex align-items-center gap-2 text-warning">
                    <i class="bi bi-star-fill fs-3"></i>
                    <span class="display-6 fw-extrabold text-white"><?= number_format($product['rating'], 1) ?></span>
                    <span class="text-muted fs-6">/ 5.0</span>
                </div>
                <small class="text-muted">Basado en <?= count($reviews) ?> calificaciones</small>
            </div>

            <button class="btn btn-nexus-primary btn-sm py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#reviewFormCollapse" aria-expanded="false" aria-controls="reviewFormCollapse">
                <i class="bi bi-pencil-square me-1"></i>Emitir Valoracion
            </button>
        </div>
    </div>

    <!-- Formulario Desplegable de Resena -->
    <div class="collapse mb-4" id="reviewFormCollapse">
        <div class="card bg-dark border-secondary p-4 rounded-3">
            <h5 class="fw-bold text-white mb-3">Publicar Nueva Evaluacion Tecnica</h5>
            
            <?php if (!is_logged_in()): ?>
                <div class="alert alert-info d-flex align-items-center gap-2 mb-0">
                    <i class="bi bi-info-circle-fill fs-5"></i>
                    <div>
                        Debe <a href="login.php?redirect=<?= urlencode("product-detail.php?id=$product_id") ?>" class="alert-link">iniciar sesion</a> para emitir una valoracion tecnica en el sistema.
                    </div>
                </div>
            <?php else: ?>
                <form action="product-detail.php?id=<?= $product_id ?>" method="POST">
                    <input type="hidden" name="action" value="submit_review">
                    
                    <!-- Widget de Calificacion de Estrellas Interactivas (RF-04) -->
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted d-block">Puntuacion General (1 a 5 Estrellas)</label>
                        <div class="d-flex align-items-center gap-2">
                            <div class="star-rating-widget" id="star-rating-widget">
                                <i class="bi bi-star-fill active" data-value="1"></i>
                                <i class="bi bi-star-fill active" data-value="2"></i>
                                <i class="bi bi-star-fill active" data-value="3"></i>
                                <i class="bi bi-star-fill active" data-value="4"></i>
                                <i class="bi bi-star-fill active" data-value="5"></i>
                            </div>
                            <input type="hidden" name="rating" id="rating-input" value="5">
                            <span class="text-warning small fw-bold ms-2" id="rating-text-feedback">5 de 5 estrellas</span>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">Titulo del Analisis</label>
                        <input type="text" name="title" required class="form-control form-control-nexus" placeholder="Ej. Rendimiento optimo en virtualizacion intensiva">
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">Comentarios y Observaciones</label>
                        <textarea name="comment" required rows="3" class="form-control form-control-nexus" placeholder="Detalle condiciones de operacion, temperatura, latencia y ventajas del equipamiento..."></textarea>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-nexus-outline btn-sm" data-bs-toggle="collapse" data-bs-target="#reviewFormCollapse">Cancelar</button>
                        <button type="submit" class="btn btn-nexus-primary btn-sm py-2 px-4">
                            <i class="bi bi-send me-1"></i>Publicar Calificacion
                        </button>
                    </div>
                </form>
            <?php endif; ?>
        </div>
    </div>

    <!-- Listado de Resenas Registradas -->
    <div class="d-flex flex-column gap-3">
        <?php if (empty($reviews)): ?>
            <p class="text-muted small fst-italic py-3 mb-0">Este producto aun no cuenta con resenas registradas. Sea el primero en emitir una evaluacion tecnica.</p>
        <?php else: ?>
            <?php foreach ($reviews as $rev): ?>
                <div class="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <div class="p-1.5 rounded-circle bg-secondary bg-opacity-25 text-light" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                <i class="bi bi-person fs-6"></i>
                            </div>
                            <div>
                                <span class="fw-bold text-white small d-block"><?= htmlspecialchars($rev['user_name']) ?></span>
                                <small class="text-muted" style="font-size: 0.7rem;"><?= format_date($rev['created_at']) ?></small>
                            </div>
                        </div>

                        <div class="text-warning small d-flex gap-1">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                <i class="bi <?= $i <= $rev['rating'] ? 'bi-star-fill' : 'bi-star' ?>"></i>
                            <?php endfor; ?>
                            <span class="text-light fw-bold ms-1"><?= $rev['rating'] ?>/5</span>
                        </div>
                    </div>

                    <h6 class="fw-bold text-white small mb-1"><?= htmlspecialchars($rev['title']) ?></h6>
                    <p class="text-muted small mb-0"><?= htmlspecialchars($rev['comment']) ?></p>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
