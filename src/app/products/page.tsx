"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters, FilterState } from "@/components/products/ProductFilters";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { PackageX, ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface ProductItem {
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
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "ALL",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sort: "newest",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.category && filters.category !== "ALL") params.set("category", filters.category);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.inStock) params.set("inStock", "true");
      params.set("sort", filters.sort);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categories) {
          setCategories(data.categories);
        }
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      q: "",
      category: "ALL",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sort: "newest",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Encabezado */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Equipamiento Certificado</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Catalogo Corporativo de Productos
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Filtre, ordene y seleccione servidores, estaciones de trabajo y dispositivos de red con garantia y stock verificado.
        </p>
      </div>

      {/* Componente de Filtros y Busqueda */}
      <ProductFilters
        filters={filters}
        categories={categories}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Resumen de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando {products.length} de {pagination.total} productos registrados
        </span>
        {filters.category !== "ALL" && (
          <span className="font-semibold text-indigo-400">
            Filtrado por: {filters.category}
          </span>
        )}
      </div>

      {/* Grid de Productos o Estados de Carga */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
            <PackageX className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              No se encontraron productos coincidentes
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intente ajustar los parametros de busqueda, rango de precios o categoria seleccionada.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Limpiar filtros de busqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {/* Paginacion */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-white">
            Pagina {pagination.page} de {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
            }
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
          Cargando catalogo de productos...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
