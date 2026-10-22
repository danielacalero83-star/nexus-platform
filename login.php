<?php
require_once __DIR__ . '/config/auth.php';

// Si ya esta autenticado, redirigir
if (is_logged_in()) {
    header('Location: ' . (is_admin() ? 'admin/index.php' : 'products.php'));
    exit;
}

$pdo = get_db();
$error = '';
$email = '';
$redirect = $_GET['redirect'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $redirect = $_POST['redirect'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Por favor complete todos los campos obligatorios.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            login_user($user);
            set_flash('success', 'Sesion iniciada', "Bienvenido al portal corporativo, {$user['name']}.");

            if (!empty($redirect) && strpos($redirect, 'http') === false) {
                header('Location: ' . $redirect);
            } elseif ($user['role'] === 'ADMIN') {
                header('Location: admin/index.php');
            } else {
                header('Location: products.php');
            }
            exit;
        } else {
            $error = 'Credenciales de acceso invalidas. Verifique su correo o contrasena.';
        }
    }
}

$page_title = 'Inicio de Sesion Corporativo';
require_once __DIR__ . '/includes/header.php';
?>

<div class="row justify-content-center py-5">
    <div class="col-md-7 col-lg-5 col-xl-4">
        <div class="text-center mb-4">
            <div class="brand-icon mx-auto mb-3" style="width: 48px; height: 48px;">
                <i class="bi bi-shield-lock fs-4"></i>
            </div>
            <h1 class="h3 fw-bold text-white mb-1">Acceso al Sistema</h1>
            <p class="text-muted small">Ingrese sus credenciales de seguridad corporativa para continuar.</p>
        </div>

        <div class="card card-nexus p-4 shadow-lg mb-4">
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <div><?= htmlspecialchars($error) ?></div>
                </div>
            <?php endif; ?>

            <form action="login.php" method="POST" autocomplete="off" id="nexus-login-form">
                <input type="hidden" name="redirect" value="<?= htmlspecialchars($redirect) ?>">

                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Correo Electronico</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-envelope"></i>
                        </span>
                        <input type="email" name="email" id="login-email" required class="form-control form-control-nexus" value="<?= ($_SERVER['REQUEST_METHOD'] === 'POST' ? htmlspecialchars($email) : '') ?>" placeholder="usuario@nexus.com" autocomplete="off">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label small fw-bold text-muted">Contrasena</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-lock"></i>
                        </span>
                        <input type="password" name="password" id="login-password" required class="form-control form-control-nexus" placeholder="********" autocomplete="new-password">
                    </div>
                </div>

                <button type="submit" class="btn btn-nexus-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <span>Iniciar Sesion</span>
                    <i class="bi bi-arrow-right"></i>
                </button>
            </form>

            <div class="text-center pt-3 mt-3 border-top border-secondary-subtle">
                <small class="text-muted">No posee una cuenta corporativa? </small>
                <a href="register.php" class="small text-primary fw-semibold text-decoration-none">Registrese aqui</a>
            </div>
        </div>
    </div>
</div>

<script>
    // Limpieza forzada de campos al cerrar sesion o navegar hacia atras
    window.addEventListener('pageshow', function () {
        <?php if ($_SERVER['REQUEST_METHOD'] !== 'POST'): ?>
        var emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.value = '';
        <?php endif; ?>
        var passInput = document.getElementById('login-password');
        if (passInput) passInput.value = '';
    });
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
