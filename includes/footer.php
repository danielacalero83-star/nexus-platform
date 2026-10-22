<?php
$is_in_admin = defined('IS_ADMIN_SECTION') && IS_ADMIN_SECTION === true;
$root_prefix = $is_in_admin ? '../' : '';
?>
    </div><!-- Fin del container-fluid max-w-7xl -->
</main>

<!-- Pie de Pagina Corporativo -->
<footer class="footer-nexus mt-auto pt-5">
    <!-- Barra de Ventajas de Infraestructura -->
    <div class="border-bottom border-secondary-subtle pb-4 mb-4">
        <div class="container-fluid max-w-7xl px-lg-4">
            <div class="row g-4 text-start">
                <div class="col-md-3 d-flex align-items-center gap-3">
                    <div class="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                        <i class="bi bi-shield-check fs-4"></i>
                    </div>
                    <div>
                        <h6 class="text-white mb-0 fw-bold fs-7">Garantia Certificada</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Equipamiento 100% de grado corporativo</small>
                    </div>
                </div>

                <div class="col-md-3 d-flex align-items-center gap-3">
                    <div class="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                        <i class="bi bi-truck fs-4"></i>
                    </div>
                    <div>
                        <h6 class="text-white mb-0 fw-bold fs-7">Logistica Especializada</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Despacho asegurado y trazable</small>
                    </div>
                </div>

                <div class="col-md-3 d-flex align-items-center gap-3">
                    <div class="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                        <i class="bi bi-lock fs-4"></i>
                    </div>
                    <div>
                        <h6 class="text-white mb-0 fw-bold fs-7">Transacciones Blindadas</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Sesiones seguras y hashing Bcrypt</small>
                    </div>
                </div>

                <div class="col-md-3 d-flex align-items-center gap-3">
                    <div class="p-2.5 rounded-3 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                        <i class="bi bi-headset fs-4"></i>
                    </div>
                    <div>
                        <h6 class="text-white mb-0 fw-bold fs-7">Soporte Tecnico 24/7</h6>
                        <small class="text-muted" style="font-size: 0.75rem;">Especialistas en infraestructura IT</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Enlaces y Secciones Informativas -->
    <div class="container-fluid max-w-7xl px-lg-4 pb-4">
        <div class="row g-4">
            <div class="col-lg-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <div class="brand-icon" style="width: 32px; height: 32px;">
                        <i class="bi bi-layers-fill fs-6"></i>
                    </div>
                    <span class="fw-bold text-white fs-5">NEXUS</span>
                </div>
                <p class="text-muted small leading-relaxed">
                    Plataforma integral de suministro y gestion tecnologica para centros de datos, estaciones de ingenieria y seguridad perimetral de redes.
                </p>
            </div>

            <div class="col-6 col-lg-2">
                <h6 class="text-white fw-bold text-uppercase fs-7 mb-3">Soluciones</h6>
                <ul class="list-unstyled text-muted small d-flex flex-column gap-2">
                    <li><a href="<?= $root_prefix ?>products.php?category=Servidores y Redes" class="text-decoration-none text-muted">Servidores y Redes</a></li>
                    <li><a href="<?= $root_prefix ?>products.php?category=Estaciones de Trabajo" class="text-decoration-none text-muted">Estaciones de Trabajo</a></li>
                    <li><a href="<?= $root_prefix ?>products.php?category=Almacenamiento Empresarial" class="text-decoration-none text-muted">Almacenamiento</a></li>
                    <li><a href="<?= $root_prefix ?>products.php?category=Ciberseguridad y Perifericos" class="text-decoration-none text-muted">Ciberseguridad</a></li>
                </ul>
            </div>

            <div class="col-6 col-lg-2">
                <h6 class="text-white fw-bold text-uppercase fs-7 mb-3">Plataforma</h6>
                <ul class="list-unstyled text-muted small d-flex flex-column gap-2">
                    <li><a href="<?= $root_prefix ?>products.php" class="text-decoration-none text-muted">Catalogo de Equipos</a></li>
                    <li><a href="<?= $root_prefix ?>login.php" class="text-decoration-none text-muted">Portal de Clientes</a></li>
                    <li><a href="<?= $root_prefix ?>admin/index.php" class="text-decoration-none text-muted">Panel Administrativo</a></li>
                </ul>
            </div>

            <div class="col-lg-4">
                <h6 class="text-white fw-bold text-uppercase fs-7 mb-3">Seguridad y Normativa</h6>
                <p class="text-muted small">
                    Implementacion estricta de control de acceso basado en roles (RBAC), consultas preparadas con PDO para prevencion de inyeccion SQL y cifrado de contrasenas con algoritmo Bcrypt.
                </p>
                <div class="d-flex gap-2">
                    <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-shield-lock me-1"></i>PDO Sanitized</span>
                    <span class="badge bg-dark border border-secondary text-light"><i class="bi bi-key me-1"></i>Bcrypt Hashed</span>
                </div>
            </div>
        </div>

        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-4 mt-4 border-top border-secondary-subtle text-muted small">
            <div>Nexus Enterprise Platform. Todos los derechos reservados.</div>
            <div class="d-flex gap-3 mt-2 mt-sm-0">
                <span>Politica de Privacidad</span>
                <span>Terminos de Uso</span>
                <span>Auditoria de Seguridad</span>
            </div>
        </div>
    </div>
</footer>

<!-- Bootstrap 5.3 Bundle con Popper JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

<!-- Logica Cliente Personalizada -->
<script src="<?= $root_prefix ?>assets/js/main.js"></script>
</body>
</html>
