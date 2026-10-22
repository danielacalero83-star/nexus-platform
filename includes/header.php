<?php
require_once __DIR__ . '/../config/auth.php';
$cart_count = get_cart_count();
$user = current_user();

// Determinar ruta relativa para assets dependiendo de si estamos en /admin/ o en la raiz
$is_in_admin = defined('IS_ADMIN_SECTION') && IS_ADMIN_SECTION === true;
$root_prefix = $is_in_admin ? '../' : '';
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($page_title) ? htmlspecialchars($page_title) . ' | ' : '' ?>NEXUS Enterprise Platform</title>
    <meta name="description" content="Plataforma corporativa de adquisicion y gestion de infraestructura IT, servidores rack, estaciones de trabajo y ciberseguridad.">
    
    <!-- Bootstrap 5.3 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    
    <!-- Bootstrap Icons (Iconografia Vectorial 100% libre de emojis) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Estilos Personalizados Enterprise -->
    <link rel="stylesheet" href="<?= $root_prefix ?>assets/css/custom.css">
</head>
<body>

<!-- Barra de Navegacion Superior -->
<nav class="navbar navbar-expand-lg navbar-nexus sticky-top py-2">
    <div class="container-fluid max-w-7xl px-lg-4">
        <!-- Logotipo -->
        <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="<?= $root_prefix ?>index.php">
            <div class="brand-icon">
                <i class="bi bi-layers-fill fs-5"></i>
            </div>
            <div class="d-flex flex-column">
                <span class="fw-bold text-white fs-5 lh-1 tracking-tight">NEXUS</span>
                <span class="text-uppercase fw-semibold text-primary" style="font-size: 0.65rem; letter-spacing: 1.5px;">Enterprise Hub</span>
            </div>
        </a>

        <!-- Boton Hamburguesa Mobile -->
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nexusNavbar" aria-controls="nexusNavbar" aria-expanded="false" aria-label="Alternar navegacion">
            <i class="bi bi-list text-white fs-2"></i>
        </button>

        <!-- Menu Desplegable -->
        <div class="collapse navbar-collapse" id="nexusNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
                <li class="nav-item">
                    <a class="nav-link px-3 py-2 rounded text-light" href="<?= $root_prefix ?>products.php">
                        <i class="bi bi-grid me-1"></i> Catalogo
                    </a>
                </li>
                <?php if ($user): ?>
                    <li class="nav-item">
                        <a class="nav-link px-3 py-2 rounded text-light" href="<?= $root_prefix ?>orders.php">
                            <i class="bi bi-box-seam me-1"></i> Mis Pedidos
                        </a>
                    </li>
                <?php endif; ?>
                <?php if (is_admin()): ?>
                    <li class="nav-item">
                        <a class="nav-link px-3 py-2 rounded text-warning fw-semibold" href="<?= $root_prefix ?>admin/index.php">
                            <i class="bi bi-speedometer2 me-1"></i> Panel Administrador
                        </a>
                    </li>
                <?php endif; ?>
            </ul>

            <!-- Acciones de Usuario y Carrito -->
            <div class="d-flex align-items-center gap-3">
                <!-- Boton de Carrito -->
                <a href="<?= $root_prefix ?>cart.php" class="btn btn-nexus-outline position-relative px-3 py-2 d-flex align-items-center gap-2" title="Ver carrito">
                    <i class="bi bi-cart3 fs-6"></i>
                    <span class="d-none d-sm-inline fs-7">Carrito</span>
                    <span id="navbar-cart-badge" class="badge bg-primary rounded-pill <?= $cart_count > 0 ? '' : 'd-none' ?>">
                        <?= $cart_count ?>
                    </span>
                </a>

                <!-- Autenticacion / Menu de Usuario -->
                <?php if ($user): ?>
                    <div class="dropdown">
                        <button class="btn btn-nexus-outline dropdown-toggle d-flex align-items-center gap-2 py-2" type="button" id="userMenuDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-person-circle fs-6"></i>
                            <div class="text-start d-none d-sm-block">
                                <span class="d-block fw-semibold text-white fs-7 lh-1"><?= htmlspecialchars($user['name']) ?></span>
                                <small class="text-muted" style="font-size: 0.7rem;">
                                    <?= $user['role'] === 'ADMIN' ? 'Administrador' : 'Usuario Estandar' ?>
                                </small>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow border-secondary" aria-labelledby="userMenuDropdown">
                            <li class="px-3 py-2 border-bottom border-secondary-subtle">
                                <span class="d-block fw-bold text-white small"><?= htmlspecialchars($user['name']) ?></span>
                                <span class="d-block text-muted small"><?= htmlspecialchars($user['email']) ?></span>
                                <span class="badge <?= $user['role'] === 'ADMIN' ? 'bg-warning text-dark' : 'bg-primary' ?> mt-1">
                                    Rol: <?= $user['role'] ?>
                                </span>
                            </li>
                            <?php if (is_admin()): ?>
                                <li>
                                    <a class="dropdown-item py-2" href="<?= $root_prefix ?>admin/index.php">
                                        <i class="bi bi-speedometer2 me-2 text-warning"></i>Panel de Control
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item py-2" href="<?= $root_prefix ?>admin/products.php">
                                        <i class="bi bi-boxes me-2 text-info"></i>Gestion de Productos (CRUD)
                                    </a>
                                </li>
                            <?php endif; ?>
                            <li>
                                <a class="dropdown-item py-2" href="<?= $root_prefix ?>orders.php">
                                    <i class="bi bi-receipt me-2 text-primary"></i>Historial de Compras
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item py-2 text-danger" href="<?= $root_prefix ?>logout.php">
                                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesion
                                </a>
                            </li>
                        </ul>
                    </div>
                <?php else: ?>
                    <div class="d-flex align-items-center gap-2">
                        <a href="<?= $root_prefix ?>login.php" class="btn btn-nexus-outline py-2 fs-7">
                            Iniciar Sesion
                        </a>
                        <a href="<?= $root_prefix ?>register.php" class="btn btn-nexus-primary py-2 fs-7">
                            Registro
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</nav>

<!-- Contenedor Principal -->
<main class="py-4">
    <div class="container-fluid max-w-7xl px-lg-4">
        <!-- Renderizado de Notificaciones Flash -->
        <?php foreach (get_flashes() as $flash): ?>
            <div class="alert alert-<?= $flash['type'] ?> alert-dismissible fade show d-flex align-items-center gap-3 shadow-sm border-0" role="alert">
                <i class="bi <?= $flash['type'] === 'success' ? 'bi-check-circle-fill' : ($flash['type'] === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill') ?> fs-4"></i>
                <div>
                    <strong><?= htmlspecialchars($flash['title']) ?></strong>
                    <?php if (!empty($flash['message'])): ?>
                        <div class="small"><?= htmlspecialchars($flash['message']) ?></div>
                    <?php endif; ?>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
        <?php endforeach; ?>
