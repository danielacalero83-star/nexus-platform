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
            <!-- Credenciales de Demostracion Rapida para Evaluadores -->
            <div class="p-3 mb-3 rounded-3 bg-black bg-opacity-50 border border-secondary border-opacity-50">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="small text-muted fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">
                        <i class="bi bi-info-circle me-1 text-primary"></i> Acceso Rápido Demo
                    </span>
                </div>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary flex-fill text-nowrap py-1" onclick="document.getElementById('login-email').value='admin@nexus.com'; document.getElementById('login-password').value='AdminPassword2026!';">
                        <i class="bi bi-shield-check me-1"></i> Admin
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-light flex-fill text-nowrap py-1" onclick="document.getElementById('login-email').value='usuario@nexus.com'; document.getElementById('login-password').value='UserPassword2026!';">
                        <i class="bi bi-person me-1"></i> Usuario
                    </button>
                </div>
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <div><?= htmlspecialchars($error) ?></div>
                </div>
            <?php endif; ?>

            <form action="login.php" method="POST">
                <input type="hidden" name="redirect" value="<?= htmlspecialchars($redirect) ?>">

                <div class="mb-3">
                    <label class="form-label small fw-bold text-muted">Correo Electronico</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-envelope"></i>
                        </span>
                        <input type="email" name="email" id="login-email" required class="form-control form-control-nexus" value="<?= htmlspecialchars($email) ?>" placeholder="usuario@nexus.com">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label small fw-bold text-muted">Contrasena</label>
                    <div class="input-group">
                        <span class="input-group-text bg-dark border-secondary text-muted">
                            <i class="bi bi-lock"></i>
                        </span>
                        <input type="password" name="password" id="login-password" required class="form-control form-control-nexus" placeholder="********">
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

<?php require_once __DIR__ . '/includes/footer.php'; ?>
