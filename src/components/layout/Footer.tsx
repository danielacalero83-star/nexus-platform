import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Headphones, Truck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400">
      {/* Barra de valor agregado */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Garantia Certificada</p>
              <p className="text-xs text-slate-400">Equipamiento 100% de grado corporativo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Logistica Especializada</p>
              <p className="text-xs text-slate-400">Despacho asegurado y trazable</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transacciones Blindadas</p>
              <p className="text-xs text-slate-400">Protocolos JWT y cifrado de datos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Soporte Tecnico 24/7</p>
              <p className="text-xs text-slate-400">Especialistas en infraestructura IT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces y Derechos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">NEXUS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma integral de suministro y gestion tecnologica para centros de datos, estaciones de ingenieria y seguridad de redes.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Soluciones
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=Servidores y Redes" className="hover:text-white transition-colors">
                  Servidores y Redes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Estaciones de Trabajo" className="hover:text-white transition-colors">
                  Estaciones de Trabajo
                </Link>
              </li>
              <li>
                <Link href="/products?category=Almacenamiento Empresarial" className="hover:text-white transition-colors">
                  Almacenamiento Empresarial
                </Link>
              </li>
              <li>
                <Link href="/products?category=Ciberseguridad y Perifericos" className="hover:text-white transition-colors">
                  Ciberseguridad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Plataforma
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Catalogo Completo
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Portal de Clientes
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Cumplimiento y Normativa
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema verificado bajo estandares de codificacion segura OWASP, RBAC estricto e integridad referencial transaccional.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>
            Nexus Enterprise Platform. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Privacidad de Datos</span>
            <span>Terminos de Contratacion</span>
            <span>Politica de Seguridad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
