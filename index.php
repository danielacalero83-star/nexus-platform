<?php
require_once __DIR__ . '/config/auth.php';
$pdo = get_db();

$page_title = 'Plataforma Corporativa de Suministro IT';

// Obtener productos destacados
$stmt = $pdo->query("SELECT * FROM products WHERE featured = 1 AND status = 'ACTIVE' ORDER BY id DESC LIMIT 4");
$featured_products = $stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="hero-gradient py-5 mb-5 rounded-4 text-center">
    <div class="container py-4">
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary text-uppercase fw-semibold mb-3" style="font-size: 0.75rem; letter-spacing: 1px;">
            <i class="bi bi-lightning-charge-fill"></i> Infraestructura Tecnologica de Alto Desempeno
        </div>

        <h1 class="display-5 fw-extrabold text-white mb-3 tracking-tight">
            Plataforma Corporativa de Suministro y Gestion IT
        </h1>

        <p class="lead text-muted mx-auto mb-4" style="max-w: 750px;">
            Adquisicion directa, configuracion a medida y trazabilidad operativa para centros de datos, redes empresariales y estaciones de ingenieria.
        </p>

        <div class="d-flex flex-wrap justify-content-center gap-3">
            <a href="products.php" class="btn btn-nexus-primary d-inline-flex align-items-center gap-2 py-2.5 px-4 fs-6">
                <span>Explorar Catalogo Especializado</span>
                <i class="bi bi-arrow-right"></i>
            </a>
            <a href="login.php" class="btn btn-nexus-outline d-inline-flex align-items-center gap-2 py-2.5 px-4 fs-6">
                <i class="bi bi-shield-lock"></i>
                <span>Portal de Clientes</span>
            </a>
        </div>

        <!-- Metricas de Desempeno -->
        <div class="row g-4 mt-5 pt-4 border-top border-secondary-subtle justify-content-center text-center">
            <div class="col-6 col-md-3">
                <h3 class="fw-extrabold text-white mb-0">99.9%</h3>
                <small class="text-muted">Confiabilidad de Hardware</small>
            </div>
            <div class="col-6 col-md-3">
                <h3 class="fw-extrabold text-white mb-0">+1,200</h3>
                <small class="text-muted">Equipos Desplegados</small>
            </div>
            <div class="col-6 col-md-3">
                <h3 class="fw-extrabold text-white mb-0">24/7</h3>
                <small class="text-muted">Soporte Tecnico Especializado</small>
            </div>
            <div class="col-6 col-md-3">
                <h3 class="fw-extrabold text-white mb-0">100%</h3>
                <small class="text-muted">Garantia Certificada</small>
            </div>
        </div>
    </div>
</section>

<!-- Categorias de Equipamiento -->
<section class="mb-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
            <span class="text-primary text-uppercase fw-semibold small" style="letter-spacing: 1px;">Segmentacion</span>
            <h2 class="h3 fw-bold text-white mb-0">Lineas de Infraestructura</h2>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-md-6 col-lg-3">
            <div class="card card-nexus h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                    <div class="p-3 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-block mb-3">
                        <i class="bi bi-hdd-network fs-3"></i>
                    </div>
                    <h5 class="fw-bold text-white mb-2">Servidores y Redes</h5>
                    <p class="text-muted small">Servidores rack 1U/2U, switches capa 3 y routing de alta densidad para centros de datos.</p>
                </div>
                <div class="pt-3 border-top border-secondary-subtle">
                    <a href="products.php?category=Servidores y Redes" class="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1">
                        <span>Ver equipamiento</span>
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-lg-3">
            <div class="card card-nexus h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                    <div class="p-3 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-block mb-3">
                        <i class="bi bi-cpu fs-3"></i>
                    </div>
                    <h5 class="fw-bold text-white mb-2">Estaciones de Trabajo</h5>
                    <p class="text-muted small">Workstations de alto poder de computo para simulacion, renderizado 3D y portatiles ejecutivos.</p>
                </div>
                <div class="pt-3 border-top border-secondary-subtle">
                    <a href="products.php?category=Estaciones de Trabajo" class="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1">
                        <span>Ver equipamiento</span>
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-lg-3">
            <div class="card card-nexus h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                    <div class="p-3 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-block mb-3">
                        <i class="bi bi-device-ssd fs-3"></i>
                    </div>
                    <h5 class="fw-bold text-white mb-2">Almacenamiento</h5>
                    <p class="text-muted small">Sistemas NAS de alta capacidad, cabinas SAN y unidades NVMe hot-swap para respaldo.</p>
                </div>
                <div class="pt-3 border-top border-secondary-subtle">
                    <a href="products.php?category=Almacenamiento Empresarial" class="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1">
                        <span>Ver equipamiento</span>
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-lg-3">
            <div class="card card-nexus h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                    <div class="p-3 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-block mb-3">
                        <i class="bi bi-shield-check fs-3"></i>
                    </div>
                    <h5 class="fw-bold text-white mb-2">Ciberseguridad</h5>
                    <p class="text-muted small">Firewalls UTM perimetrales, proteccion VPN SSL y sistemas de alimentacion UPS online.</p>
                </div>
                <div class="pt-3 border-top border-secondary-subtle">
                    <a href="products.php?category=Ciberseguridad y Perifericos" class="text-primary text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1">
                        <span>Ver equipamiento</span>
                        <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Productos Destacados -->
<section class="mb-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
            <span class="text-primary text-uppercase fw-semibold small" style="letter-spacing: 1px;">Destacados</span>
            <h2 class="h3 fw-bold text-white mb-0">Equipamiento con Mayor Demanda</h2>
        </div>
        <a href="products.php" class="btn btn-nexus-outline py-2 px-3 small d-inline-flex align-items-center gap-2">
            <span>Ver Catalogo Completo</span>
            <i class="bi bi-arrow-right"></i>
        </a>
    </div>

    <div class="row g-4">
        <?php foreach ($featured_products as $prod): ?>
            <div class="col-md-6 col-lg-3">
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
        <?php endforeach; ?>
    </div>
</section>


<?php require_once __DIR__ . '/includes/footer.php'; ?>
