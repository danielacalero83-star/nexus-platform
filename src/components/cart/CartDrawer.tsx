"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    shipping,
    total,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <div
        className="fixed inset-0"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Carrito de Solicitudes
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              {items.length} {items.length === 1 ? "linea" : "lineas"}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">El carrito esta vacio</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Agregue equipos o componentes del catalogo para formalizar una orden.
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Explorar catalogo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-all"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/50">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      SKU: {item.sku}
                    </p>
                    <p className="text-sm font-bold text-indigo-400 mt-1">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      aria-label="Eliminar producto del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen financiero y acciones */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-slate-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IVA (13%)</span>
                <span className="font-medium text-slate-200">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Envio empresarial</span>
                <span className="font-medium text-slate-200">
                  {shipping === 0 ? "Gratuito (Orden > $1,000)" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Total Estimado</span>
                <span className="text-indigo-400">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
              >
                Proceder al Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
              >
                Vaciar todos los articulos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
