import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ProductDetailClient } from "./ProductDetailClient";
import { ReviewSection } from "@/components/products/ReviewSection";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
      {/* Migas de pan (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href="/products" className="hover:text-white transition-colors">
          Catalogo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-white transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Seccion Principal del Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Imagen del Producto */}
        <div className="relative aspect-square w-full rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <Image
            src={product.imageUrl}
            alt={`Fotografia detallada de ${product.name}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Ficha Tecnica y Acciones de Compra */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {product.category}
              </span>
              <span className="font-mono text-xs text-slate-400">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Precios */}
          <div className="flex items-baseline gap-4 pt-2 border-t border-slate-800">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-slate-500 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
            <span className="text-xs text-slate-400">Precios no incluyen IVA</span>
          </div>

          {/* Estado de Existencias */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Sin existencias disponibles de entrega inmediata</span>
              </div>
            ) : isLowStock ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Inventario critico: solo {product.stock} unidades en bodega</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Disponible para despacho ({product.stock} unidades)</span>
              </div>
            )}
          </div>

          {/* Descripcion */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Descripcion General
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Especificaciones */}
          {product.specifications && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Especificaciones Tecnicas de Fabrica
              </h3>
              <p className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line">
                {product.specifications}
              </p>
            </div>
          )}

          {/* Accion interactiva de Carrito (Componente Cliente) */}
          <ProductDetailClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
              sku: product.sku,
              category: product.category,
            }}
          />

          {/* Beneficios de Compra */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Garantia oficial 3 anos</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Envio con seguro total</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Soporte de reemplazo RMA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seccion Interactivas de Resenas y Calificaciones */}
      <ReviewSection
        productId={product.id}
        initialReviews={product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          userName: r.userName || r.user?.name || "Usuario Anonimo",
          createdAt: r.createdAt,
        }))}
        averageRating={product.rating}
        reviewCount={product.reviewCount}
      />
    </div>
  );
}
