// NEXUS Enterprise Platform - Client Interactive Logic
// Cumplimiento estricto: CERO EMOJIS, iconografia vectorial Bootstrap Icons y texto formal.

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar tooltips y popovers de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (el) {
        return new bootstrap.Tooltip(el);
    });

    // Modulo Interactivo de Calificacion con Estrellas (RF-04)
    initStarRatingWidget();

    // Manejador interactivo para botones 'Agregar al Carrito'
    initAddToCartButtons();
});

// Funcion para mostrar notificaciones Toast contextuales y formales
function showNexusToast(title, message, type = 'success') {
    let container = document.getElementById('nexus-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'nexus-toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1100';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const borderClass = type === 'success' ? 'border-success' : (type === 'danger' ? 'border-danger' : 'border-info');
    const iconClass = type === 'success' ? 'bi-check-circle-fill text-success' : (type === 'danger' ? 'bi-x-circle-fill text-danger' : 'bi-info-circle-fill text-info');

    const html = `
        <div id="${toastId}" class="toast align-items-center text-white bg-dark border ${borderClass} shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-start gap-2">
                    <i class="bi ${iconClass} fs-5 mt-n1"></i>
                    <div>
                        <strong class="d-block text-white">${title}</strong>
                        <small class="text-white-50">${message}</small>
                    </div>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Widget Interactivo de Estrellas
function initStarRatingWidget() {
    const widget = document.getElementById('star-rating-widget');
    if (!widget) return;

    const stars = widget.querySelectorAll('i');
    const input = document.getElementById('rating-input');

    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            const val = parseInt(this.dataset.value, 10);
            stars.forEach(s => {
                if (parseInt(s.dataset.value, 10) <= val) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });

        star.addEventListener('mouseout', function () {
            stars.forEach(s => s.classList.remove('hover'));
        });

        star.addEventListener('click', function () {
            const val = parseInt(this.dataset.value, 10);
            input.value = val;
            stars.forEach(s => {
                if (parseInt(s.dataset.value, 10) <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            const textFeedback = document.getElementById('rating-text-feedback');
            if (textFeedback) {
                textFeedback.textContent = val + ' de 5 estrellas';
            }
        });
    });
}

// Acciones de Carrito vía AJAX
function initAddToCartButtons() {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            const quantityInput = document.getElementById('product-quantity-' + productId);
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

            const originalHtml = this.innerHTML;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Agregando...';
            this.disabled = true;

            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('product_id', productId);
            formData.append('quantity', quantity);

            fetch('api/cart-action.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                this.innerHTML = originalHtml;
                this.disabled = false;

                if (data.success) {
                    showNexusToast('Producto Anadido', data.message, 'success');
                    updateCartBadge(data.cart_count);
                } else {
                    showNexusToast('No disponible', data.error || 'No se pudo agregar el producto.', 'danger');
                }
            })
            .catch(() => {
                this.innerHTML = originalHtml;
                this.disabled = false;
                showNexusToast('Error de conexion', 'No se pudo comunicar con el servidor.', 'danger');
            });
        });
    });
}

function updateCartBadge(count) {
    const badge = document.getElementById('navbar-cart-badge');
    if (badge) {
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    }
}
