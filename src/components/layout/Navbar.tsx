"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Layers,
  ShoppingCart,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  Package,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logotipo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight">
                NEXUS
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Enterprise Hub
              </span>
            </div>
          </Link>

          {/* Navegacion Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/products"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isActive("/products")
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Catalogo
            </Link>

            {user && (
              <Link
                href="/orders"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive("/orders")
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Package className="w-4 h-4" />
                Mis Pedidos
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive("/admin")
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-indigo-400 hover:bg-indigo-500/10"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel Administrador
              </Link>
            )}
          </nav>
        </div>

        {/* Acciones del lado derecho */}
        <div className="flex items-center gap-3">
          {/* Boton del Carrito */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white ring-2 ring-slate-950 animate-in zoom-in-75">
                {itemCount}
              </span>
            )}
          </button>

          {/* Autenticacion / Perfil */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    {user.role === "ADMIN" ? (
                      <span className="text-amber-400 font-medium flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      "Usuario Estandar"
                    )}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Cerrar sesion"
                  aria-label="Cerrar sesion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>

          {/* Boton Hamburguesa Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Alternar menu de navegacion"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu desplegable Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg px-4 pt-2 pb-5 space-y-3 animate-in slide-in-from-top-2">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-white"
          >
            Catalogo
          </Link>
          {user && (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-200 hover:text-white"
            >
              Mis Pedidos
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Panel Administrador
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/60 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium rounded-xl border border-slate-700 text-white"
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white"
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
