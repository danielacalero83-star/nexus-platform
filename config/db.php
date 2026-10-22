<?php
// NEXUS Enterprise Platform - Modulo de Conexion y Persistencia de Base de Datos
// Utiliza PDO con SQLite para ejecucion local inmediata sin configuraciones complejas.

function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $db_dir = __DIR__ . '/../database';
    if (!is_dir($db_dir)) {
        mkdir($db_dir, 0777, true);
    }

    $db_file = $db_dir . '/nexus.sqlite';
    $is_new_db = !file_exists($db_file);

    try {
        $pdo = new PDO('sqlite:' . $db_file);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA foreign_keys = ON;');

        if ($is_new_db) {
            init_database($pdo);
        }

        return $pdo;
    } catch (PDOException $e) {
        die('Error critico al conectar con la base de datos: ' . $e->getMessage());
    }
}

function init_database(PDO $pdo): void {
    // Creacion de tablas relacionales
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            specifications TEXT,
            price REAL NOT NULL,
            compare_price REAL,
            stock INTEGER NOT NULL DEFAULT 0,
            sku TEXT UNIQUE NOT NULL,
            image_url TEXT NOT NULL,
            category TEXT NOT NULL,
            featured INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            rating REAL NOT NULL DEFAULT 0.0,
            review_count INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            title TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'COMPLETED',
            payment_method TEXT NOT NULL DEFAULT 'CREDIT_CARD',
            payment_status TEXT NOT NULL DEFAULT 'PAID',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            unit_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        );
    ");

    seed_database($pdo);
}

function seed_database(PDO $pdo): void {
    // 1. Usuarios predeterminados con contrasenas encriptadas con Bcrypt
    $admin_pass = password_hash('AdminPassword2026!', PASSWORD_BCRYPT);
    $user_pass = password_hash('UserPassword2026!', PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Administrador General', 'admin@nexus.com', $admin_pass, 'ADMIN']);
    $admin_id = $pdo->lastInsertId();

    $stmt->execute(['Carlos Mendoza', 'usuario@nexus.com', $user_pass, 'USER']);
    $user_id = $pdo->lastInsertId();

    // 2. Catalogo corporativo de productos
    $products = [
        [
            'Servidor Rack Nexus PowerEdge R750',
            'servidor-rack-nexus-poweredge-r750',
            'Servidor empresarial de 2U con doble procesador Intel Xeon Gold, 128GB RAM ECC DDR4 y 4TB NVMe en configuracion RAID 10. Disenado para virtualizacion de alta densidad y cargas criticas.',
            "Procesador: Dual Intel Xeon Gold 6330 (56 cores totales)\nRAM: 128GB DDR4 ECC 3200MHz\nAlmacenamiento: 4x 1TB NVMe U.2 Enterprise\nRed: 4x 10GbE SFP+\nFuente redundante 1400W Platinum",
            4899.99,
            5399.99,
            8,
            'SRV-NX-750',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
            'Servidores y Redes',
            1,
            'ACTIVE',
            4.9,
            2
        ],
        [
            'Switch Capa 3 Nexus Core Catalyst 48X',
            'switch-capa-3-nexus-core-catalyst-48x',
            'Switch gestionable de 48 puertos Gigabit PoE+ con 4 enlaces uplink 10G SFP+. Soporte completo para VLANs dinamicas, OSPF, enrutamiento estatico y proteccion avanzada contra denegacion de servicio.',
            "Puertos: 48x 10/100/1000 Mbps RJ45 PoE+ (370W budget)\nUplinks: 4x 10G SFP+\nCapacidad de conmutacion: 176 Gbps\nCapa: Layer 3 Full Management\nProtocolos: OSPF, BGP, SNMPv3, SSH",
            1850.00,
            2100.00,
            15,
            'NET-CAT-48X',
            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1000&q=80',
            'Servidores y Redes',
            1,
            'ACTIVE',
            4.8,
            1
        ],
        [
            'Estacion de Trabajo Nexus Precision 7920',
            'estacion-de-trabajo-nexus-precision-7920',
            'Workstation de torre para renderizado 3D, simulacion de ingenieria y entrenamiento de modelos de inteligencia artificial. Equipada con GPU NVIDIA RTX A6000 48GB y 256GB de memoria RAM.',
            "GPU: NVIDIA RTX A6000 48GB GDDR6\nCPU: AMD Threadripper PRO 5965WX (24 Cores / 48 Threads)\nRAM: 256GB DDR4 ECC 3200MHz\nAlmacenamiento: 2x 2TB Gen4 M.2 SSD\nChasis acusticamente optimizado",
            6799.00,
            7299.00,
            5,
            'WS-PREC-7920',
            'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1000&q=80',
            'Estaciones de Trabajo',
            1,
            'ACTIVE',
            5.0,
            2
        ],
        [
            'Laptop Ultrabook Corporativa Nexus ThinkPro X1',
            'laptop-ultrabook-corporativa-nexus-thinkpro-x1',
            'Portatil profesional ultraligero de fibra de carbono con pantalla OLED 4K 14 pulgadas, procesador Intel Core Ultra 7, 32GB LPDDR5X y modem 5G LTE integrado para movilidad ejecutiva.',
            "Pantalla: 14.0 OLED 4K HDR 500 nits antirreflejo\nProcesador: Intel Core Ultra 7 165H\nRAM: 32GB 7467MHz soldada\nAlmacenamiento: 1TB PCIe 4.0 NVMe\nBateria: 57Wh con carga rapida de 65W USB-C",
            2199.50,
            2450.00,
            22,
            'LAP-TP-X1',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
            'Estaciones de Trabajo',
            0,
            'ACTIVE',
            4.7,
            1
        ],
        [
            'Sistema NAS Empresarial Nexus SynoStore 8B',
            'sistema-nas-empresarial-nexus-synostore-8b',
            'Unidad de almacenamiento conectado a red de 8 bahias con soporte para discos SATA/SAS de hasta 22TB cada uno. Incluye cache dual M.2 NVMe, puerto 10GbE y redundancia de hardware.',
            "Bahias: 8x 3.5/2.5 Hot-swap\nProcesador: AMD Ryzen Quad-Core 2.2GHz\nMemoria: 32GB ECC ampliable a 64GB\nRed: 1x 10GbE RJ45 + 2x 1GbE\nNiveles RAID: RAID 0, 1, 5, 6, 10, JBOD",
            1450.00,
            1650.00,
            12,
            'STR-NAS-8B',
            'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1000&q=80',
            'Almacenamiento Empresarial',
            1,
            'ACTIVE',
            4.6,
            1
        ],
        [
            'Firewall UTM Hardware Nexus FortiShield 100F',
            'firewall-utm-hardware-nexus-fortishield-100f',
            'Dispositivo de ciberseguridad perimetral de proxima generacion con inspeccion SSL profunda, prevencion de intrusiones (IPS), filtrado de contenido web y soporte para 500 tuneles VPN IPsec concurrentes.',
            "Throughput Firewall: 20 Gbps\nThroughput IPS: 2.6 Gbps\nThroughput NGFW: 1.6 Gbps\nTuneles VPN IPsec: 500 concurrentes\nInterfaces: 2x 10G SFP+, 16x GE RJ45, 2x GE RJ45 WAN",
            2950.00,
            null,
            7,
            'SEC-FORTI-100F',
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
            'Ciberseguridad y Perifericos',
            0,
            'ACTIVE',
            4.9,
            1
        ],
        [
            'Unidad UPS Online Doble Conversion 3000VA',
            'unidad-ups-online-doble-conversion-3000va',
            'Sistema de alimentacion ininterrumpida de onda senoidal pura para racks de centros de datos. Factor de potencia 1.0, autonomia ampliable mediante bancos de baterias externos y tarjeta SNMP incluida.',
            "Capacidad: 3000VA / 3000W\nTopologia: Online Doble Conversion\nTomas: 8x IEC C13, 2x IEC C19\nTiempo de transferencia: 0 ms\nComunicacion: USB, RS232, Ranura SNMP inteligente",
            1120.00,
            1290.00,
            9,
            'PWR-UPS-3K',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
            'Ciberseguridad y Perifericos',
            0,
            'ACTIVE',
            4.5,
            1
        ],
        [
            'Monitor Profesional 32 Pulgadas 4K IPS Nexus ProView',
            'monitor-profesional-32-pulgadas-4k-ips-nexus-proview',
            'Monitor para calibracion de color profesional, resolucion UHD 3840x2160, 99% Adobe RGB, 98% DCI-P3 con conexion USB-C Hub con suministro de energia de 90W y soporte ergonomico completo.',
            "Panel: 32 IPS Antirreflejo\nResolucion: 3840 x 2160 a 60Hz\nPrecision: Delta E menor a 2\nPuertos: 1x USB-C (90W PD), 1x DisplayPort 1.4, 2x HDMI 2.0, Hub 4x USB 3.2\nCalibrador de hardware integrado",
            899.00,
            999.00,
            18,
            'MON-PV-32K',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
            'Estaciones de Trabajo',
            0,
            'ACTIVE',
            4.8,
            1
        ],
    ];

    $prod_stmt = $pdo->prepare("
        INSERT INTO products (
            name, slug, description, specifications, price, compare_price,
            stock, sku, image_url, category, featured, status, rating, review_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $created_product_ids = [];
    foreach ($products as $p) {
        $prod_stmt->execute($p);
        $created_product_ids[] = $pdo->lastInsertId();
    }

    // 3. Resenas iniciales
    $rev_stmt = $pdo->prepare("INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)");
    $rev_stmt->execute([
        $created_product_ids[0],
        $user_id,
        'Carlos Mendoza',
        5,
        'Rendimiento sobresaliente en virtualizacion VMware',
        'Instalamos este servidor en nuestro cluster de virtualizacion y el comportamiento termico y de procesamiento ha superado las expectativas.'
    ]);
    $rev_stmt->execute([
        $created_product_ids[0],
        $admin_id,
        'Administrador General',
        5,
        'Fiabilidad demostrada para bases de datos criticas',
        'Excelente arquitectura de hardware. Los modulos de redundancia de fuente y almacenamiento U.2 operan con latencias ultra bajas.'
    ]);
    $rev_stmt->execute([
        $created_product_ids[2],
        $user_id,
        'Carlos Mendoza',
        5,
        'Potencia de computo inigualable para diseno CAD',
        'La workstation maneja escenas complejas de render y simulacion estructural sin caida de frames.'
    ]);

    // 4. Orden de prueba inicial
    $ord_stmt = $pdo->prepare("
        INSERT INTO orders (
            order_number, user_id, customer_name, customer_email,
            shipping_address, subtotal, tax, shipping_cost, total, status, payment_method, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $ord_stmt->execute([
        'ORD-2026-0001',
        $user_id,
        'Carlos Mendoza',
        'usuario@nexus.com',
        'Avenida Tecnologica 405, Parque Empresarial Norte, San Salvador',
        4899.99,
        636.99,
        0.00,
        5536.98,
        'COMPLETED',
        'TRANSFER',
        'PAID'
    ]);
    $order_id = $pdo->lastInsertId();

    $item_stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $item_stmt->execute([
        $order_id,
        $created_product_ids[0],
        'Servidor Rack Nexus PowerEdge R750',
        4899.99,
        1,
        4899.99
    ]);
}
