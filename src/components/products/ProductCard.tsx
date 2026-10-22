"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingCart, Check, AlertTriangle } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    stock: number;
    sku: string;
    imageUrl: string;
    category: string;
    rating: number;
    reviewCount: number;
    status: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      {/* Contenedor de Imagen */}
      <Link
        href={`/products/${product.slug}`}
        style={{ position: "relative" }}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-950"
      >
        <Image
          src={product.imageUrl}
          alt={`Fotografia de ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Categoria */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Estado de Inventario */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-950/90 text-rose-300 border border-rose-800/80 shadow-sm">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-sm">
              <AlertTriangle className="w-3 h-3" />
              Ultimas {product.stock} un.
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 shadow-sm">
              <Check className="w-3 h-3" />
              En Stock
            </span>
          )}
        </div>
      </Link>

      {/* Informacion del Producto */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">SKU: {product.sku}</span>
            {/* Puntuacion con estrellas vectoriales */}
            <div className="flex items-center gap-1 text-amber-400" aria-label={`Calificacion: ${product.rating} de 5`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-semibold text-slate-200">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Precio y Boton de compra */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-white">
              {formatCurrency(product.price)}
            </div>
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatCurrency(product.comparePrice)}
              </div>
            )}
          </div>

          <button
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.imageUrl,
                stock: product.stock,
                sku: product.sku,
                category: product.category,
              })
            }
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
