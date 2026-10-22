"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, ArrowRight, Plus, Minus } from "lucide-react";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    stock: number;
    sku: string;
    category: string;
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const { addItem, setIsCartOpen } = useCart();
  const router = useRouter();

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      {/* Selector de Cantidades */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-400">Cantidad requerida:</span>

        <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Reducir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="px-4 text-sm font-bold text-white min-w-[3rem] text-center">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
            disabled={quantity >= product.stock || isOutOfStock}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-slate-500">
          (Max. {product.stock} disponibles)
        </span>
      </div>

      {/* Botones de Accion */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4 text-indigo-400" />
          Agregar al Carrito
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Comprar Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
