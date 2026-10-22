# NEXUS Enterprise Platform (Full-Stack Enterprise Architecture)

Plataforma web de nivel corporativo orientada a la adquisición, gestión de inventarios y trazabilidad de infraestructura tecnológica avanzada (servidores de centros de datos, estaciones de trabajo especializadas, redes de alta capacidad y sistemas de ciberseguridad).

El repositorio implementa una **arquitectura dual de alto rendimiento**:
1. **Stack Primario SSR:** Desarrollado con **PHP 8.x nativo**, persistencia relacional con **PDO (SQLite / MySQL)**, transacciones atómicas ACID, seguridad RBAC y diseño corporativo de alto contraste con **Bootstrap 5.3** e iconografía vectorial **Bootstrap Icons** (100% libre de emojis).
2. **Stack Moderno Desacoplado:** Desarrollado con **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma ORM (SQLite / PostgreSQL)**, **Tailwind CSS v4**, autenticación criptográfica **JWT (Jose)** y validación de esquemas con **Zod**.

---

## 🌐 Despliegue en la Nube (Cloud Deployment)

La plataforma se encuentra publicada y en ejecución continua en la infraestructura cloud de **Render**:
- **URL Pública de Producción:** [https://nexus-platform-ihwj.onrender.com](https://nexus-platform-ihwj.onrender.com)
- **Infraestructura:** Contenedor Docker (PHP 8.2 Alpine + SQLite + Bootstrap 5.3)
- **Disponibilidad:** 100% Operativo y accesible globalmente sin requerir configuración adicional.

---

## 1. Galería Visual de la Plataforma (Capturas de Pantalla)

| Módulo | Captura de Pantalla | Descripción Técnica |
| :--- | :--- | :--- |
| **01. Inicio y Métricas** | ![Página de Inicio](docs/screenshots/01-home-hero.jpg) | Portada corporativa con indicadores ejecutivos de confiabilidad (99.9%), inventario activo (+1,200 equipos), acceso a roles y equipamiento con mayor demanda. |
| **02. Catálogo y Filtros** | ![Catálogo de Equipamiento](docs/screenshots/02-catalogo-filtros.jpg) | Catálogo interactivo con búsqueda en tiempo real por palabra clave, filtrado combinable por categorías, rango dinámico de precios, disponibilidad y ordenamiento. |
| **03. Panel Administrativo (CRUD)** | ![Panel de Control CRUD](docs/screenshots/03-panel-admin-crud.jpg) | Dashboard de KPIs (facturación global, órdenes, stock crítico) y tabla de gestión CRUD con modales de alta, edición y archivado seguro. |
| **04. Checkout y Transacciones** | ![Checkout y Formalización](docs/screenshots/04-checkout-transaccion.jpg) | Pasarela transaccional con descuento atómico de inventario en base de datos (`beginTransaction`), cálculo de IVA (13%), flete bonificado y confirmación correlativa `ORD-YYYY-XXXX`. |

---

## 2. Descripción del Proyecto y Principios de Ingeniería

### 2.1 Visión General
NEXUS Enterprise Platform es una solución integral diseñada bajo patrones de ingeniería web modular y segura. Permite a los clientes corporativos explorar especificaciones técnicas de hardware, calcular cotizaciones y liquidar pedidos con validación de inventario en tiempo real, así como registrar valoraciones técnicas y consultar la trazabilidad contable de sus adquisiciones.

### 2.2 Principios de Ingeniería Aplicados
- **Arquitectura Modular por Capas:** Separación estricta entre capa de presentación, controladores de lógica de negocio, middleware de autenticación y capa de acceso a datos.
- **Control de Acceso Basado en Roles (RBAC):** Restricción jerárquica de recursos a nivel de servidor (`require_admin()` en PHP y Edge Middleware en Next.js), diferenciando los roles `ADMIN` y `USER`.
- **Transacciones Atómicas ACID:** El módulo de compras liquida pedidos y descuenta existencias mediante bloques transaccionales (`beginTransaction` / `commit` / `rollBack`), mitigando condiciones de carrera y sobreventa.
- **Seguridad en Profundidad (OWASP):** Contraseñas hasheadas con algoritmo unidireccional `Bcrypt` (cost 10), consultas 100% parametrizadas mediante `Prepared Statements` (prevención de SQLi), desinfección de salidas con `htmlspecialchars` (prevención de XSS) y cookies de sesión configuradas con flags `HttpOnly` y `SameSite`.
- **Norma Estricta Cero Emojis:** Erradicación total de caracteres emoji informales en toda la interfaz, empleando exclusivamente iconos vectoriales SVG de precisión técnica y terminología formal.

---

## 3. Arquitectura de Datos y Diagrama Entidad-Relación (ER)

El modelo de datos relacional garantiza la integridad referencial y auditoría histórica. Si un producto posee órdenes vinculadas, el sistema aplica suspensión lógica (`ARCHIVED`) para proteger los registros contables.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "emite (1:N)"
    USERS ||--o{ REVIEWS : "publica (1:N)"
    PRODUCTS ||--o{ ORDER_ITEMS : "referenciado (1:N)"
    PRODUCTS ||--o{ REVIEWS : "calificado_en (1:N)"
    ORDERS ||--|{ ORDER_ITEMS : "contiene (1:N)"

    USERS {
        int id PK
        string name "VARCHAR(150)"
        string email "VARCHAR(190) UNIQUE"
        string password "VARCHAR(255) Bcrypt"
        string role "VARCHAR(20) USER|ADMIN"
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        string name "VARCHAR(200)"
        string slug "VARCHAR(220) UNIQUE"
        text description
        text specifications
        decimal price "DECIMAL(10,2)"
        decimal compare_price "DECIMAL(10,2) NULL"
        int stock "INT DEFAULT 0"
        string sku "VARCHAR(50) UNIQUE"
        string image_url "TEXT"
        string category "VARCHAR(100)"
        int featured "TINYINT(1)"
        string status "VARCHAR(20) ACTIVE|DRAFT|ARCHIVED"
        decimal rating "DECIMAL(2,1)"
        int review_count "INT DEFAULT 0"
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        int id PK
        int product_id FK
        int user_id FK
        string user_name "VARCHAR(150)"
        int rating "INT (1 a 5)"
        string title "VARCHAR(150)"
        text comment
        timestamp created_at
    }

    ORDERS {
        int id PK
        string order_number "VARCHAR(50) UNIQUE (ORD-YYYY-XXXX)"
        int user_id FK
        string customer_name "VARCHAR(150)"
        string customer_email "VARCHAR(190)"
        text shipping_address
        decimal subtotal "DECIMAL(10,2)"
        decimal tax "DECIMAL(10,2) (13% IVA)"
        decimal shipping_cost "DECIMAL(10,2)"
        decimal total "DECIMAL(10,2)"
        string status "VARCHAR(20) PENDING|PROCESSING|SHIPPED|COMPLETED|CANCELLED"
        string payment_method "VARCHAR(50) CREDIT_CARD|TRANSFER|CORPORATE_CREDIT"
        string payment_status "VARCHAR(20) PAID|PENDING"
        timestamp created_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        string product_name "VARCHAR(200)"
        decimal unit_price "DECIMAL(10,2)"
        int quantity "INT"
        decimal subtotal "DECIMAL(10,2)"
    }
```

---

## 4. Especificación Técnica de los Endpoints de la API

La plataforma expone endpoints para comunicación asíncrona cliente-servidor (AJAX) y arquitectura RESTful:

### 4.1 Endpoints del Stack PHP (AJAX)

| Método | Endpoint | Autenticación | Parámetros / Payload | Respuestas y Códigos HTTP | Propósito |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/cart-action.php` | Pública / Sesión | `action` ("add")<br>`product_id` (int)<br>`quantity` (int) | • `200 OK`: `{"success": true, "cart_count": 3, "message": "..."}`<br>• `400 Bad Request`: `{"success": false, "error": "Sin stock"}` | Adición y modificación de artículos en el carrito en tiempo real con verificación de existencias en base de datos. |

### 4.2 Endpoints del Stack Next.js (RESTful)

| Método | Endpoint | Autenticación | Payload / Query Params | Respuestas y Códigos HTTP | Propósito |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Pública | `{"name", "email", "password"}` | • `201 Created`: `{"user": {...}}`<br>• `400 Bad Request`: Error de validación Zod<br>• `409 Conflict`: Correo ya registrado | Registro con política estricta de contraseña y hashing Bcrypt. |
| `POST` | `/api/auth/login` | Pública | `{"email", "password"}` | • `200 OK`: Cookie HttpOnly `nexus_token` + `{"user": {...}}`<br>• `401 Unauthorized`: Credenciales inválidas | Inicio de sesión seguro con emisión de JWT criptográfico (HS256). |
| `POST` | `/api/auth/logout` | Sesión | Ninguno | • `200 OK`: `{"message": "Sesion cerrada"}` | Invalidación y limpieza de la cookie de sesión. |
| `GET` | `/api/auth/me` | Sesión | Cookie `nexus_token` | • `200 OK`: `{"user": {...}}`<br>• `401 Unauthorized`: No autenticado | Obtención de los datos del usuario actualmente autenticado. |
| `GET` | `/api/products` | Pública | Query: `q`, `category`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, `limit` | • `200 OK`: `{"products": [...], "pagination": {...}, "categories": [...]}` | Catálogo paginado con filtros combinables y ordenamiento dinámico. |
| `POST` | `/api/admin/products` | Requerida (`ADMIN`) | `{"name", "sku", "price", "stock", "category", "imageUrl", ...}` | • `201 Created`: `{"product": {...}}`<br>• `403 Forbidden`: Privilegios insuficientes | Creación de nuevo ítem en inventario (CRUD Create). |
| `PUT` | `/api/admin/products/[id]`| Requerida (`ADMIN`) | `{"name", "price", "stock", "status", ...}` | • `200 OK`: `{"product": {...}}`<br>• `404 Not Found`: ID no encontrado | Actualización de datos técnicos de equipamiento (CRUD Update). |
| `DELETE`| `/api/admin/products/[id]`| Requerida (`ADMIN`) | Ninguno (URL param) | • `200 OK`: `{"message": "Registro eliminado / archivado"}` | Eliminación física o suspensión a `ARCHIVED` (CRUD Delete). |
| `POST` | `/api/orders` | Requerida (`USER`) | `{"customerName", "customerEmail", "shippingAddress", "paymentMethod", "items": [...]}` | • `201 Created`: `{"orderNumber": "ORD-2026-XXXX", "total": ...}`<br>• `400 Bad Request`: Existencias insuficientes | Transacción atómica de checkout con descuento de existencias. |
| `GET` | `/api/orders` | Requerida (`USER` / `ADMIN`) | Query: `page`, `limit` | • `200 OK`: `{"orders": [...]}` | Historial de compras y trazabilidad operativa de órdenes. |

---

## 5. Variables de Entorno y Configuración (.env.example)

El proyecto incluye la plantilla preconfigurada [`.env.example`](.env.example) en la raíz del proyecto. Para configurar el entorno, copie el archivo a `.env`:

```powershell
cp .env.example .env
```

### Detalle de Variables Requeridas

| Variable de Entorno | Tipo | Valor Predeterminado (Local) | Descripción y Uso |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String (URI) | `"file:./dev.db"` | Cadena de conexión relacional. Utiliza SQLite embebido localmente; en producción (Vercel Postgres, Supabase, Railway, Neon) se especifica la URI `postgresql://usuario:password@host:5432/nexus_db?schema=public`. |
| `JWT_SECRET` | String (Cripto) | Clave secreta generada | Llave simétrica de al menos 32 caracteres empleada por la librería `jose` para firmar y verificar tokens de autenticación JWT almacenados en cookies HttpOnly. |
| `NEXT_PUBLIC_APP_URL` | String (URL) | `"http://localhost:3000"` | Dirección URL base de la aplicación empleada para el enrutamiento absoluto, redirecciones de autenticación y metatags canónicos SEO. |

---

## 6. Guía de Instalación y Ejecución Local

### Opción A: Ejecución del Stack PHP Nativo (Recomendado para evaluación inmediata)

#### Requisitos Previos:
- PHP 8.0 o superior (disponible en XAMPP, WampServer, Laragon o instalación independiente).
- Extensiones estándar activadas: `pdo`, `pdo_sqlite`.

#### Paso 1: Abrir terminal en la carpeta del proyecto
```powershell
cd "c:\Users\danie\OneDrive\Desktop\proyecto final"
```

#### Paso 2: Iniciar el servidor web local
```powershell
& "C:\xampp\php\php.exe" -S localhost:8080 -t "c:\Users\danie\OneDrive\Desktop\proyecto final"
```
*(Si tiene PHP configurado en las variables de entorno PATH, ejecute simplemente `php -S localhost:8080`).*

#### Paso 3: Acceder en el navegador
```
http://localhost:8080
```
*Nota: La base de datos SQLite (`database/nexus.sqlite`) se genera y puebla automáticamente con datos iniciales en la primera ejecución si no existe.*

---

### Opción B: Ejecución del Stack Next.js 16 (App Router + Prisma)

#### Requisitos Previos:
- Node.js 18.x o superior y npm.

#### Paso 1: Instalar dependencias
```powershell
npm install
```

#### Paso 2: Generar el cliente de base de datos y poblar registros
```powershell
npx prisma generate
npx prisma db push
npm run db:seed
```

#### Paso 3: Iniciar el servidor de desarrollo
```powershell
npm run dev
```

#### Paso 4: Acceder en el navegador
```
http://localhost:3000
```

---

## 7. Credenciales Preconfiguradas para Evaluación

En la pantalla de inicio de sesión (`login.php` o `/login`) se encuentran disponibles credenciales demo para ambos roles:

* **Cuenta Administrador (Acceso total al sistema y panel `/admin`)**:
  * Correo: `admin@nexus.com`
  * Contraseña: `AdminPassword2026!`
* **Cuenta Usuario Estándar (Exploración, carrito, checkout, valoraciones y pedidos)**:
  * Correo: `usuario@nexus.com`
  * Contraseña: `UserPassword2026!`

---

## 8. Estructura Completa del Repositorio

```
proyecto final/
|-- admin/                        # Capa Administrativa (PHP)
|   |-- index.php                 # Panel de Control con KPIs y métricas ejecutivas
|   |-- orders.php                # Gestión del ciclo de vida y estado de pedidos
|   |-- products.php              # Módulo CRUD completo de productos
|-- api/                          # Endpoints asíncronos (PHP)
|   |-- cart-action.php           # Endpoint AJAX para operaciones del carrito
|-- assets/                       # Recursos estáticos
|   |-- css/custom.css            # Estilos Enterprise oscuros sobre Bootstrap 5
|   |-- js/main.js                # Lógica interactiva cliente (AJAX, estrellas, toasts)
|-- config/                       # Capa de Configuración y Seguridad (PHP)
|   |-- auth.php                  # Manejo de sesiones, roles RBAC y flash messages
|   |-- db.php                    # Conexión PDO SQLite y semillero automático
|-- database/                     # Persistencia Relacional
|   |-- nexus.sqlite              # Base de datos SQLite embebida funcional
|   |-- schema.sql                # Esquema DDL SQL estándar
|-- docs/                         # Documentación y Evidencias
|   |-- screenshots/              # Capturas de pantalla de alta resolución
|       |-- 01-home-hero.jpg
|       |-- 02-catalogo-filtros.jpg
|       |-- 03-panel-admin-crud.jpg
|       |-- 04-checkout-transaccion.jpg
|-- includes/                     # Componentes y Plantillas Reutilizables (PHP)
|   |-- footer.php                # Pie de página institucional y carga de scripts
|   |-- header.php                # Barra de navegación superior con badge y sesión
|-- prisma/                       # Capa ORM Prisma (Next.js)
|   |-- schema.prisma             # Modelo de datos relacional para Prisma
|   |-- seed.ts                   # Semillero de datos iniciales en TypeScript
|-- src/                          # Stack Next.js 16 (App Router)
|   |-- app/                      # Rutas de página y API Routes RESTful
|   |-- components/               # Componentes UI (CartDrawer, ProductFilters, etc.)
|   |-- context/                  # Contextos de React (AuthContext, CartContext, Toast)
|   |-- lib/                      # Validaciones Zod, utilidades y cliente Prisma
|   |-- middleware.ts             # Edge Middleware para protección de rutas y RBAC
|-- .env                          # Variables de entorno activas
|-- .env.example                  # Plantilla de variables de entorno requeridas
|-- cart.php                      # Carrito de compras con resumen de liquidación
|-- checkout.php                  # Pasarela interactiva de compra transaccional
|-- index.php                     # Portada corporativa con métricas y destacados
|-- login.php                     # Inicio de sesión con autenticación segura
|-- logout.php                    # Cierre de sesión y regeneración de ID
|-- orders.php                    # Historial de compras y trazabilidad de pedidos
|-- package.json                  # Dependencias y scripts de Next.js
|-- product-detail.php            # Ficha técnica, compras y módulo de reseñas
|-- products.php                  # Catálogo con búsqueda, filtros y ordenamiento
|-- register.php                  # Registro de usuarios con validaciones de seguridad
|-- README.md                     # Documentación técnica maestra del proyecto
```

---

## 9. Despliegue en Servidores en la Nube / Hosting

### 9.1 Despliegue en XAMPP Local
1. Copiar la carpeta del proyecto en `C:\xampp\htdocs\nexus`.
2. Iniciar el servicio Apache desde el Panel de Control de XAMPP.
3. Abrir en el navegador: `http://localhost/nexus`.

### 9.2 Despliegue en Hosting Tradicional (cPanel / Apache / Nginx)
1. Subir los archivos al directorio `public_html` del servidor vía FTP o Administrador de Archivos.
2. Si se utiliza MySQL, importar `database/schema.sql` y ajustar la conexión en `config/db.php`:
   ```php
   $pdo = new PDO("mysql:host=localhost;dbname=nexus_db;charset=utf8mb4", "usuario", "contrasena");
   ```
3. Verificar que la versión de PHP del servidor esté configurada en PHP 8.0+.

### 9.3 Despliegue en Vercel / Railway / Render
1. Para el stack Next.js: Conectar el repositorio en [Vercel](https://vercel.com) o [Railway](https://railway.app).
2. Configurar las variables de entorno en el panel del hosting (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`).
3. El comando de build ejecutará automáticamente `npm run build`.
