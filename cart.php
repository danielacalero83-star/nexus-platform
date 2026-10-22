<?php
require_once __DIR__ . '/config/auth.php';
$pdo = get_db();

// Manejo de peticiones POST de modificacion del carrito
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $product_id = (int)($_POST['product_id'] ?? 0);
    $quantity = max(1, (int)($_POST['quantity'] ?? 1));

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    if ($action === 'add' && $product_id > 0) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND status = 'ACTIVE'");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();

        if ($product) {
            if ($product['stock'] <= 0) {
                set_flash('danger', 'Inventario agotado', "El producto {$product['name']} no posee existencias.");
            } else {
                $current_qty = $_SESSION['cart'][$product_id]['quantity'] ?? 0;
                $new_qty = $current_qty + $quantity;

                if ($new_qty > $product['stock']) {
                    $_SESSION['cart'][$product_id] = [
                        'id' => $product['id'],
                        'name' => $product['name'],
                        'slug' => $product['slug'],
                        'sku' => $product['sku'],
                        'price' => (float)$product['price'],
                        'image_url' => $product['image_url'],
                        'stock' => (int)$product['stock'],
                        'quantity' => (int)$product['stock'],
                    ];
                    set_flash('warning', 'Limite de inventario alcanzado', "Solo hay {$product['stock']} unidades disponibles.");
                } else {
                    $_SESSION['cart'][$product_id] = [
                        'id' => $product['id'],
                        'name' => $product['name'],
                        'slug' => $product['slug'],
                        'sku' => $product['sku'],
                        'price' => (float)$product['price'],
                        'image_url' => $product['image_url'],
                        'stock' => (int)$product['stock'],
                        'quantity' => $new_qty,
                    ];
                    set_flash('success', 'Carrito actualizado', "{$product['name']} agregado al pedido.");
                }
            }
        }

        if (isset($_POST['buy_now']) && $_POST['buy_now'] == '1') {
            header('Location: checkout.php');
            exit;
        }

        header('Location: cart.php');
        exit;
    }

    if ($action === 'update' && $product_id > 0) {
        if (isset($_SESSION['cart'][$product_id])) {
            $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
            $stmt->execute([$product_id]);
            $stock = (int)$stmt->fetchColumn();

            if ($quantity <= 0) {
                unset($_SESSION['cart'][$product_id]);
                set_flash('info', 'Articulo removido', 'El producto fue eliminado del carrito.');
            } elseif ($quantity > $stock) {
                $_SESSION['cart'][$product_id]['quantity'] = $stock;
                set_flash('warning', 'Stock maximo superado', "Se ajusto a la cantidad maxima disponible: $stock unidades.");
            } else {
                $_SESSION['cart'][$product_id]['quantity'] = $quantity;
                set_flash('success', 'Cantidad actualizada', 'Se modificaron las unidades requeridas.');
            }
        }
        header('Location: cart.php');
        exit;
    }

    if ($action === 'remove' && $product_id > 0) {
        unset($_SESSION['cart'][$product_id]);
        set_flash('info', 'Producto eliminado', 'El articulo fue retirado del carrito de compra.');
        header('Location: cart.php');
        exit;
    }

    if ($action === 'clear') {
        $_SESSION['cart'] = [];
        set_flash('info', 'Carrito vacio', 'Se han eliminado todos los articulos del carrito.');
        header('Location: cart.php');
        exit;
    }
}

$page_title = 'Carrito de Compras Corporativo';
$cart_items = get_cart();
$totals = get_cart_totals();

require_once __DIR__ . '/includes/header.php';
?>

<div class="mb-4">
    <div class="d-flex align-items-center gap-2 text-primary small text-uppercase fw-semibold mb-1">
        <i class="bi bi-cart3"></i> Formalizacion de Requerimientos
    </div>
    <h1 class="h2 fw-extrabold text-white mb-1">Carrito de Solicitud de Equipos</h1>
    <p class="text-muted small">Revise las unidades seleccionadas, valide precios y proceda al despacho de la orden.</p>
</div>

<?php if (empty($cart_items)): ?>
    <div class="card card-nexus p-5 text-center my-4">
        <div class="mx-auto mb-3 p-3 rounded-circle bg-dark border border-secondary text-muted" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
            <i class="bi bi-cart-x fs-1"></i>
        </div>
        <h4 class="fw-bold text-white mb-2">Su carrito se encuentra vacio</h4>
        <p class="text-muted small mx-auto mb-4" style="max-w: 420px;">
            No cuenta con productos o equipamiento en su lista actual. Navegue por nuestro catalogo para agregar servidores, estaciones de trabajo o dispositivos de red.
        </p>
        <div>
            <a href="products.php" class="btn btn-nexus-primary py-2.5 px-4 d-inline-flex align-items-center gap-2">
                <span>Explorar Catalogo de Productos</span>
                <i class="bi bi-arrow-right"></i>
            </a>
        </div>
    </div>
<?php else: ?>
    <div class="row g-4 align-items-start">
        <!-- Listado de Articulos -->
        <div class="col-lg-8">
            <div class="card card-nexus overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-dark table-hover align-middle mb-0 text-start">
                        <thead class="border-secondary text-muted small text-uppercase">
                            <tr>
                                <th class="p-3">Producto</th>
                                <th class="p-3">Precio Unitario</th>
                                <th class="p-3 text-center" style="width: 160px;">Cantidad</th>
                                <th class="p-3 text-end">Subtotal</th>
                                <th class="p-3 text-center" style="width: 60px;">Accion</th>
                            </tr>
                        </thead>
                        <tbody class="divide-secondary small">
                            <?php foreach ($cart_items as $item): ?>
                                <tr>
                                    <td class="p-3">
                                        <div class="d-flex align-items-center gap-3">
                                            <img src="<?= htmlspecialchars($item['image_url']) ?>" alt="<?= htmlspecialchars($item['name']) ?>" class="rounded-2" style="width: 50px; height: 50px; object-fit: cover;">
                                            <div>
                                                <a href="product-detail.php?id=<?= $item['id'] ?>" class="text-white text-decoration-none fw-bold d-block">
                                                    <?= htmlspecialchars($item['name']) ?>
                                                </a>
                                                <span class="font-monospace text-muted" style="font-size: 0.75rem;">SKU: <?= htmlspecialchars($item['sku']) ?></span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-3 text-white fw-semibold">
                                        <?= format_currency($item['price']) ?>
                                    </td>
                                    <td class="p-3 text-center">
                                        <form action="cart.php" method="POST" class="d-flex align-items-center justify-content-center gap-1">
                                            <input type="hidden" name="action" value="update">
                                            <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                                            
                                            <input type="number" 
                                                   name="quantity" 
                                                   class="form-control form-control-nexus form-control-sm text-center fw-bold px-1" 
                                                   style="width: 70px;"
                                                   value="<?= $item['quantity'] ?>" 
                                                   min="1" 
                                                   max="<?= $item['stock'] ?>">
                                                   
                                            <button type="submit" class="btn btn-nexus-outline btn-sm py-1 px-2" title="Guardar cantidad">
                                                <i class="bi bi-arrow-repeat"></i>
                                            </button>
                                        </form>
                                    </td>
                                    <td class="p-3 text-end text-primary fw-bold">
                                        <?= format_currency($item['price'] * $item['quantity']) ?>
                                    </td>
                                    <td class="p-3 text-center">
                                        <form action="cart.php" method="POST" onsubmit="return confirm('Retirar este producto del carrito?');">
                                            <input type="hidden" name="action" value="remove">
                                            <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                                            <button type="submit" class="btn btn-outline-danger btn-sm border-0" title="Eliminar del pedido">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <div class="p-3 bg-dark d-flex justify-content-between align-items-center border-top border-secondary">
                    <a href="products.php" class="btn btn-nexus-outline btn-sm">
                        <i class="bi bi-arrow-left me-1"></i>Continuar Comprando
                    </a>
                    
                    <form action="cart.php" method="POST" onsubmit="return confirm('Desea vaciar todos los articulos del carrito?');">
                        <input type="hidden" name="action" value="clear">
                        <button type="submit" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-trash me-1"></i>Vaciar Carrito
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Resumen Financiero de la Orden -->
        <div class="col-lg-4">
            <div class="card card-nexus p-4">
                <h5 class="fw-bold text-white mb-3">Resumen de Liquidacion</h5>

                <div class="d-flex flex-column gap-2 small pb-3 mb-3 border-bottom border-secondary-subtle">
                    <div class="d-flex justify-content-between text-muted">
                        <span>Subtotal Neto:</span>
                        <span class="text-white fw-semibold"><?= format_currency($totals['subtotal']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                        <span>IVA Aplicable (13%):</span>
                        <span class="text-white fw-semibold"><?= format_currency($totals['tax']) ?></span>
                    </div>
                    <div class="d-flex justify-content-between text-muted">
                        <span>Transporte y Custodia:</span>
                        <span class="text-white fw-semibold">
                            <?= $totals['shipping'] === 0.0 ? '<span class="text-success fw-bold">Gratuito (> $1,000)</span>' : format_currency($totals['shipping']) ?>
                        </span>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-baseline mb-4">
                    <span class="fs-6 fw-bold text-white">Monto Total Estimado:</span>
                    <span class="fs-4 fw-extrabold text-primary"><?= format_currency($totals['total']) ?></span>
                </div>

                <a href="checkout.php" class="btn btn-nexus-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3">
                    <span>Proceder al Checkout</span>
                    <i class="bi bi-arrow-right fs-5"></i>
                </a>

                <div class="p-2.5 rounded-3 bg-dark border border-secondary text-muted small d-flex align-items-center gap-2">
                    <i class="bi bi-shield-check text-success fs-5"></i>
                    <span style="font-size: 0.75rem;">Transaccion protegida con validacion de inventario atomica.</span>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
