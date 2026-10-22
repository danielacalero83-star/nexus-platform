import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Server,
  Cpu,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  Lock,
  Layers,
  Zap,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    {
      name: "Servidores y Redes",
      description: "Servidores rack 1U/2U, switches capa 3 y routing de alta capacidad.",
      icon: Server,
      link: "/products?category=Servidores y Redes",
    },
    {
      name: "Estaciones de Trabajo",
      description: "Workstations para renderizado 3D, simulacion y portatiles ejecutivos.",
      icon: Cpu,
      link: "/products?category=Estaciones de Trabajo",
    },
    {
      name: "Almacenamiento Empresarial",
      description: "Unidades NAS, cabinas SAN y soluciones de respaldo redundante.",
      icon: HardDrive,
      link: "/products?category=Almacenamiento Empresarial",
    },
    {
      name: "Ciberseguridad y Perifericos",
      description: "Firewalls UTM perimetrales, proteccion VPN y sistemas UPS online.",
      icon: ShieldCheck,
      link: "/products?category=Ciberseguridad y Perifericos",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide shadow-sm">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Infraestructura Tecnologica de Alto Desempeno</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Plataforma Corporativa de Suministro y Gestion IT
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Adquisicion directa, configuracion a medida y trazabilidad operativa para centros de datos, redes empresariales y estaciones de ingenieria.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all"
            >
              Explorar Catalogo Especializado
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              Acceso a Portal de Clientes
            </Link>
          </div>

          {/* Metricas de Confianza */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.9%</p>
              <p className="text-xs text-slate-400 mt-1">Confiabilidad de Hardware</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">+1,200</p>
              <p className="text-xs text-slate-400 mt-1">Equipos Desplegados</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">24/7</p>
              <p className="text-xs text-slate-400 mt-1">Soporte Tecnico Especializado</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">Garantia Certificada</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias Principales */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Lineas de Infraestructura
          </h2>
          <p className="text-sm text-slate-400">
            Seleccione el segmento de equipamiento adecuado para su organizacion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.link}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 gap-1">
                  <span>Ver catalogo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 border-t border-slate-800 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Catalogo Destacado</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Equipamiento con Mayor Demanda
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Ver todos los productos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
