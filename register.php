<?php
require_once __DIR__ . '/config/auth.php';

if (is_logged_in()) {
    header('Location: products.php');
    exit;
}

$pdo = get_db();
$error = '';
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validacion de requisitos
    $has_min_len = strlen($password) >= 8;
    $has_upper = preg_match('/[A-Z]/', $password);
    $has_num = preg_match('/[0-9]/', $password);
    $has_special = preg_match('/[^A-Za-z0-9]/', $password);

    if (strlen($name) < 2) {
        $error = 'El nombre completo debe tener al menos 2 caracteres.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Ingrese una direccion de correo electronico valida.';
    } elseif (!$has_min_len || !$has_upper || !$has_num || !$has_special) {
        $error = 'La contrasena no cumple con las politicas de seguridad corporativa requeridas.';
    } else {
        // Verificar existencia previa
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'El correo electronico ya se encuentra registrado en la plataforma.';
        } else {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $ins_stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'USER')");
            $ins_stmt->execute([$name, $email, $hash]);
            $new_user_id = $pdo->lastInsertId();

            login_user([
                'id' => $new_user_id,
                'name' => $name,
                'email' => $email,
                'role' => 'USER',
            ]);

            set_flash('success', 'Registro exitoso', "Bienvenido a NEXUS Enterprise Platform, $name.");
            header('Location: products.php');
            exit;
        }
    }
}

$page_title = 'Registro de Usuario Corporativo';
require_once __DIR__ . '/includes/header.php';
?>

<div class="row justify-content-center py-5">
    <div class="col-md-7 col-lg-5 col-xl-4">
        <div class="text-center mb-4">
            <div class="brand-icon mx-auto mb-3" style="width: 48px; height: 48px;">
                <i class="bi bi-person-plus fs-4"></i>
            </div>
            <h1 class="h3 fw-bold text-white mb-1">Registro de Cuenta</h1>
            <p class="text-muted small">Cree una cuenta para acceder al catalogo corporativo y emitir pedidos.</p>
        </div>

        <div class="card card-nexus p-4 shadow-lg mb-4">
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <div><?= htmlspecialchars($error) ?></div>
                </div>
            <?php endif; ?>

            <form action="register.php" method="POST" autocomplete="off" id="nexus-register-form">
                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Nombre Completo</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-person"></i>
                        </span>
                        <input type="text" name="name" id="reg-name" required class="form-control form-control-nexus" value="<?= ($_SERVER['REQUEST_METHOD'] === 'POST' ? htmlspecialchars($name) : '') ?>" placeholder="Ing. Fernando Lopez" autocomplete="off">
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Correo Electronico</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-envelope"></i>
                        </span>
                        <input type="email" name="email" id="reg-email" required class="form-control form-control-nexus" value="<?= ($_SERVER['REQUEST_METHOD'] === 'POST' ? htmlspecialchars($email) : '') ?>" placeholder="contacto@empresa.com" autocomplete="off">
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Contrasena de Acceso</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-lock"></i>
                        </span>
                        <input type="password" name="password" id="reg-password" required class="form-control form-control-nexus" placeholder="********" autocomplete="new-password">
                    </div>
                    
                    <!-- Checklist de Requisitos de Contrasena (RF-01) -->
                    <div class="p-2.5 rounded bg-dark border border-secondary mt-2 small" style="font-size: 0.75rem;">
                        <span class="text-muted fw-bold d-block mb-1">Requisitos de seguridad:</span>
                        <div class="row g-1 text-muted">
                            <div class="col-6"><i class="bi bi-check-circle me-1 text-primary"></i>Minimo 8 caracteres</div>
                            <div class="col-6"><i class="bi bi-check-circle me-1 text-primary"></i>1 Mayuscula</div>
                            <div class="col-6"><i class="bi bi-check-circle me-1 text-primary"></i>1 Numero</div>
                            <div class="col-6"><i class="bi bi-check-circle me-1 text-primary"></i>1 Caracter especial</div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-nexus-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <span>Crear Cuenta Corporativa</span>
                    <i class="bi bi-arrow-right"></i>
                </button>
            </form>

            <div class="text-center pt-3 mt-3 border-top border-secondary-subtle">
                <small class="text-muted">Ya cuenta con acceso registrado? </small>
                <a href="login.php" class="small text-primary fw-semibold text-decoration-none">Inicie sesion</a>
            </div>
        </div>
    </div>
</div>

<script>
    // Limpieza de campos al cargar para evitar autorrelleno no deseado del navegador
    window.addEventListener('pageshow', function () {
        <?php if ($_SERVER['REQUEST_METHOD'] !== 'POST'): ?>
        var nameInput = document.getElementById('reg-name');
        var emailInput = document.getElementById('reg-email');
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        <?php endif; ?>
        var passInput = document.getElementById('reg-password');
        if (passInput) passInput.value = '';
    });
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
