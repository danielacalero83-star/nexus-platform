"use client";

import React from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

export interface FilterState {
  q: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sort: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  categories: string[];
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  categories,
  onChange,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
      {/* Barra de busqueda principal */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Buscar por nombre, SKU o descripcion tecnica..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          aria-label="Buscar productos"
        />
      </div>

      {/* Seccion de Filtros y Orden */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Selector de Categoria */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Categoria
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-white focus:outline-none focus:border-indigo-500"
            aria-label="Filtrar por categoria"
          >
            <option value="ALL">Todas las categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Precios */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Rango de Precios (USD)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={filters.minPrice}
              onChange={(e) => onChange({ minPrice: e.target.value })}
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              aria-label="Precio minimo"
            />
            <span className="text-slate-500 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => onChange({ maxPrice: e.target.value })}
              className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              aria-label="Precio maximo"
            />
          </div>
        </div>

        {/* Criterio de Ordenamiento */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Ordenar por
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-white focus:outline-none focus:border-indigo-500"
            aria-label="Ordenar productos"
          >
            <option value="newest">Mas recientes</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor calificados</option>
            <option value="name_asc">Nombre: A - Z</option>
            <option value="name_desc">Nombre: Z - A</option>
          </select>
        </div>

        {/* Checkbox de Disponibilidad y Boton Limpiar */}
        <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => onChange({ inStock: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            Solo con existencias
          </label>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
