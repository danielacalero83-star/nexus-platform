import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando la carga de datos iniciales en la base de datos...");

  // Limpieza inicial para idempotencia
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Generacion de hashes de contrasenas
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword2026!", salt);
  const userPasswordHash = await bcrypt.hash("UserPassword2026!", salt);

  // Creacion de usuarios con roles definidos
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@nexus.com",
      name: "Administrador General",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const standardUser = await prisma.user.create({
    data: {
      email: "usuario@nexus.com",
      name: "Carlos Mendoza",
      password: userPasswordHash,
      role: "USER",
    },
  });

  console.log("Usuarios creados exitosamente: Administrador y Usuario Estandar.");

  // Catalogo de productos empresariales
  const productsData = [
    {
      name: "Servidor Rack Nexus PowerEdge R750",
      slug: "servidor-rack-nexus-poweredge-r750",
      description: "Servidor empresarial de 2U con doble procesador Intel Xeon Gold, 128GB RAM ECC DDR4 y 4TB NVMe en configuracion RAID 10. Disenado para virtualizacion de alta densidad y cargas criticas.",
      specifications: "Procesador: Dual Intel Xeon Gold 6330 (56 cores totales) | RAM: 128GB DDR4 ECC 3200MHz | Almacenamiento: 4x 1TB NVMe U.2 Enterprise | Red: 4x 10GbE SFP+ | Fuente redundante 1400W Platinum",
      price: 4899.99,
      comparePrice: 5399.99,
      stock: 8,
      sku: "SRV-NX-750",
      category: "Servidores y Redes",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80",
      rating: 4.9,
      reviewCount: 3,
    },
    {
      name: "Switch Capa 3 Nexus Core Catalyst 48X",
      slug: "switch-capa-3-nexus-core-catalyst-48x",
      description: "Switch gestionable de 48 puertos Gigabit PoE+ con 4 enlaces uplink 10G SFP+. Soporte completo para VLANs dinamicas, OSPF, enrutamiento estatico y proteccion avanzada contra denegacion de servicio.",
      specifications: "Puertos: 48x 10/100/1000 Mbps RJ45 PoE+ (370W budget) | Uplinks: 4x 10G SFP+ | Capacidad de conmutacion: 176 Gbps | Capa: Layer 3 Full Management | Protocolos: OSPF, BGP, SNMPv3, SSH",
      price: 1850.0,
      comparePrice: 2100.0,
      stock: 15,
      sku: "NET-CAT-48X",
      category: "Servidores y Redes",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1000&q=80",
      rating: 4.8,
      reviewCount: 2,
    },
    {
      name: "Estacion de Trabajo Nexus Precision 7920",
      slug: "estacion-de-trabajo-nexus-precision-7920",
      description: "Workstation de torre para renderizado 3D, simulacion de ingenieria y entrenamiento de modelos de inteligencia artificial. Equipada con GPU NVIDIA RTX A6000 48GB y 256GB de memoria RAM.",
      specifications: "GPU: NVIDIA RTX A6000 48GB GDDR6 | CPU: AMD Threadripper PRO 5965WX (24 Cores / 48 Threads) | RAM: 256GB DDR4 ECC 3200MHz | Almacenamiento: 2x 2TB Gen4 M.2 SSD | Chasis acusticamente optimizado",
      price: 6799.0,
      comparePrice: 7299.0,
      stock: 5,
      sku: "WS-PREC-7920",
      category: "Estaciones de Trabajo",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1000&q=80",
      rating: 5.0,
      reviewCount: 4,
    },
    {
      name: "Laptop Ultrabook Corporativa Nexus ThinkPro X1",
      slug: "laptop-ultrabook-corporativa-nexus-thinkpro-x1",
      description: "Portatil profesional ultraligero de fibra de carbono con pantalla OLED 4K 14 pulgadas, procesador Intel Core Ultra 7, 32GB LPDDR5X y modem 5G LTE integrado para movilidad ejecutiva.",
      specifications: "Pantalla: 14.0 OLED 4K HDR 500 nits antirreflejo | Procesador: Intel Core Ultra 7 165H | RAM: 32GB 7467MHz soldada | Almacenamiento: 1TB PCIe 4.0 NVMe | Bateria: 57Wh con carga rapida de 65W USB-C",
      price: 2199.5,
      comparePrice: 2450.0,
      stock: 22,
      sku: "LAP-TP-X1",
      category: "Estaciones de Trabajo",
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
      rating: 4.7,
      reviewCount: 5,
    },
    {
      name: "Sistema NAS Empresarial Nexus SynoStore 8B",
      slug: "sistema-nas-empresarial-nexus-synostore-8b",
      description: "Unidad de almacenamiento conectado a red de 8 bahias con soporte para discos SATA/SAS de hasta 22TB cada uno. Incluye cache dual M.2 NVMe, puerto 10GbE y redundancia de hardware.",
      specifications: "Bahias: 8x 3.5/2.5 Hot-swap | Procesador: AMD Ryzen Quad-Core 2.2GHz | Memoria: 32GB ECC ampliable a 64GB | Red: 1x 10GbE RJ45 + 2x 1GbE | Niveles RAID: RAID 0, 1, 5, 6, 10, JBOD",
      price: 1450.0,
      comparePrice: 1650.0,
      stock: 12,
      sku: "STR-NAS-8B",
      category: "Almacenamiento Empresarial",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1000&q=80",
      rating: 4.6,
      reviewCount: 3,
    },
    {
      name: "Firewall UTM Hardware Nexus FortiShield 100F",
      slug: "firewall-utm-hardware-nexus-fortishield-100f",
      description: "Dispositivo de ciberseguridad perimetral de proxima generacion con inspeccion SSL profunda, prevencion de intrusiones (IPS), filtrado de contenido web y soporte para 500 tuneles VPN IPsec concurrentes.",
      specifications: "Throughput Firewall: 20 Gbps | Throughput IPS: 2.6 Gbps | Throughput NGFW: 1.6 Gbps | Tuneles VPN IPsec: 500 concurrentes | Interfaces: 2x 10G SFP+, 16x GE RJ45, 2x GE RJ45 WAN",
      price: 2950.0,
      comparePrice: null,
      stock: 7,
      sku: "SEC-FORTI-100F",
      category: "Ciberseguridad y Perifericos",
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80",
      rating: 4.9,
      reviewCount: 2,
    },
    {
      name: "Unidad UPS Online Doble Conversion 3000VA",
      slug: "unidad-ups-online-doble-conversion-3000va",
      description: "Sistema de alimentacion ininterrumpida de onda senoidal pura para racks de centros de datos. Factor de potencia 1.0, autonomia ampliable mediante bancos de baterias externos y tarjeta SNMP incluida.",
      specifications: "Capacidad: 3000VA / 3000W | Topologia: Online Doble Conversion | Tomas: 8x IEC C13, 2x IEC C19 | Tiempo de transferencia: 0 ms | Comunicacion: USB, RS232, Ranura SNMP inteligente",
      price: 1120.0,
      comparePrice: 1290.0,
      stock: 9,
      sku: "PWR-UPS-3K",
      category: "Ciberseguridad y Perifericos",
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
      rating: 4.5,
      reviewCount: 1,
    },
    {
      name: "Monitor Profesional 32 Pulgadas 4K IPS Nexus ProView",
      slug: "monitor-profesional-32-pulgadas-4k-ips-nexus-proview",
      description: "Monitor para calibracion de color profesional, resolucion UHD 3840x2160, 99% Adobe RGB, 98% DCI-P3 con conexion USB-C Hub con suministro de energia de 90W y soporte ergonomico completo.",
      specifications: "Panel: 32 IPS Antirreflejo | Resolucion: 3840 x 2160 a 60Hz | Precision: Delta E menor a 2 | Puertos: 1x USB-C (90W PD), 1x DisplayPort 1.4, 2x HDMI 2.0, Hub 4x USB 3.2 | Calibrador de hardware integrado",
      price: 899.0,
      comparePrice: 999.0,
      stock: 18,
      sku: "MON-PV-32K",
      category: "Estaciones de Trabajo",
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80",
      rating: 4.8,
      reviewCount: 3,
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const prod = await prisma.product.create({
      data: item,
    });
    createdProducts.push(prod);
  }

  console.log(`Se han creado ${createdProducts.length} productos en la base de datos.`);

  // Creacion de resenas iniciales
  const reviewsData = [
    {
      productId: createdProducts[0].id,
      userId: standardUser.id,
      userName: standardUser.name,
      rating: 5,
      title: "Rendimiento sobresaliente en virtualizacion VMware",
      comment: "Instalamos este servidor en nuestro cluster de virtualizacion y el comportamiento termico y de procesamiento ha superado las expectativas. La entrega fue puntual y el embalaje impecable.",
    },
    {
      productId: createdProducts[0].id,
      userId: adminUser.id,
      userName: adminUser.name,
      rating: 5,
      title: "Fiabilidad demostrada para bases de datos criticas",
      comment: "Excelente arquitectura de hardware. Los modulos de redundancia de fuente y almacenamiento U.2 operan con latencias ultra bajas.",
    },
    {
      productId: createdProducts[2].id,
      userId: standardUser.id,
      userName: standardUser.name,
      rating: 5,
      title: "Potencia de computo inigualable para diseno CAD",
      comment: "La workstation maneja escenas complejas de render y simulacion estructural sin caida de frames. Sistema de refrigeracion silencioso aun bajo carga maxima sostenida.",
    },
  ];

  for (const review of reviewsData) {
    await prisma.review.create({ data: review });
  }

  console.log("Resenas iniciales creadas satisfactoriamente.");

  // Creacion de una orden de compra de prueba
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-0001",
      userId: standardUser.id,
      customerName: standardUser.name,
      customerEmail: standardUser.email,
      shippingAddress: "Avenida Tecnologica 405, Parque Empresarial Norte, San Salvador",
      subtotal: 4899.99,
      tax: 636.99,
      shippingCost: 0.0,
      total: 5536.98,
      status: "COMPLETED",
      paymentMethod: "TRANSFER",
      paymentStatus: "PAID",
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            unitPrice: createdProducts[0].price,
            quantity: 1,
            subtotal: 4899.99,
          },
        ],
      },
    },
  });

  console.log(`Orden inicial ${sampleOrder.orderNumber} creada con exito.`);
  console.log("Proceso de poblado de base de datos finalizado.");
}

main()
  .catch((e) => {
    console.error("Error durante la ejecucion del semillero de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
