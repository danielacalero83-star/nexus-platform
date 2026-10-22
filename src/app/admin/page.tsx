"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  totalUsers: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    subtotal: number;
  }>;
}

const INITIAL_FORM = {
  name: "",
  category: "Servidores y Redes",
  price: "",
  comparePrice: "",
  stock: "",
  sku: "",
  imageUrl: "",
  description: "",
  specifications: "",
  featured: false,
  status: "ACTIVE" as "ACTIVE" | "DRAFT" | "ARCHIVED",
};

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros de busqueda para la tabla de productos admin
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal de creacion / edicion de producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de confirmacion de eliminacion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resProducts, resOrders] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/products?limit=100&sort=newest"),
        fetch("/api/orders"),
      ]);

      if (resMetrics.ok) {
        const mData = await resMetrics.json();
        setMetrics(mData.metrics);
      }

      if (resProducts.ok) {
        const pData = await resProducts.json();
        setProducts(pData.products || []);
      }

      if (resOrders.ok) {
        const oData = await resOrders.json();
        setOrders(oData.orders || []);
      }
    } catch (err) {
      console.error("Error al cargar datos administrativos:", err);
      showToast("Error", "No se pudieron recuperar las metricas de administracion.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadData();
    }
  }, [user, loadData]);

  // Si aun se verifica la autenticacion
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
        <span>Verificando permisos de acceso administrativo...</span>
      </div>
    );
  }

  // Verificacion estricta de permisos
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-rose-800/80 bg-rose-950/40 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Acceso Denegado</h1>
        <p className="text-xs text-rose-200">
          Esta seccion esta reservada exclusivamente para usuarios con rol de Administrador.
        </p>
      </div>
    );
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      comparePrice: prod.comparePrice ? prod.comparePrice.toString() : "",
      stock: prod.stock.toString(),
      sku: prod.sku,
      imageUrl: prod.imageUrl,
      description: prod.description,
      specifications: prod.specifications || "",
      featured: prod.featured,
      status: prod.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock, 10),
        sku: formData.sku,
        imageUrl: formData.imageUrl,
        description: formData.description,
        specifications: formData.specifications || undefined,
        featured: formData.featured,
        status: formData.status,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error al guardar", data.error || "Operacion no completada.", "error");
        return;
      }

      showToast(
        editingProduct ? "Producto modificado" : "Producto creado",
        editingProduct
          ? `Se actualizaron los datos de ${formData.name}.`
          : `El producto ${formData.name} fue registrado con exito.`,
        "success"
      );

      setIsModalOpen(false);
      loadData();
    } catch {
      showToast("Error de conexion", "No fue posible comunicarse con la API de productos.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error al eliminar", data.error || "No se pudo procesar la eliminacion.", "error");
        return;
      }

      showToast("Operacion completada", data.message, "info");
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadData();
    } catch {
      showToast("Error", "Ocurrio un problema al eliminar el registro.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error al actualizar", data.error, "error");
        return;
      }

      showToast("Estado actualizado", `La orden se encuentra ahora en estado ${newStatus}.`, "success");
      loadData();
    } catch {
      showToast("Error", "No se pudo modificar el estatus de la orden.", "error");
    }
  };

  // Filtrado de productos en la tabla
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Gestion de Operaciones e Inventario</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Panel de Administracion
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control integral de catalogo, ordenes de clientes, stock y KPIs de rendimiento.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Producto
        </button>
      </div>

      {/* Pestañas de Navegación del Administrador */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Metricas y Resumen
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Gestion de Catalogo ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Ordenes de Clientes ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW / METRICAS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Tarjetas KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Facturacion Total</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {metrics ? formatCurrency(metrics.totalRevenue) : "$0.00"}
              </p>
              <p className="text-xs text-slate-500">Ingresos brutos acumulados</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Ordenes Totales</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {metrics ? metrics.totalOrders : 0}
              </p>
              <p className="text-xs text-slate-500">Transacciones completadas</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Lineas en Catalogo</span>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white">
                {metrics ? metrics.totalProducts : 0}
              </p>
              <p className="text-xs text-slate-500">Items registrados activos</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Stock Critico</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-400">
                {metrics ? metrics.lowStockCount : 0}
              </p>
              <p className="text-xs text-slate-500">Menos de 5 unidades disponibles</p>
            </div>
          </div>

          {/* Ultimas Ordenes Registradas */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Ordenes Recientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-mono font-bold text-white">{ord.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-300">{ord.customerName}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                      <td className="py-3 px-4 font-bold text-indigo-400">{formatCurrency(ord.total)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTION DE CATALOGO / CRUD PRINCIPAL */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Barra de Filtros Internos para Administracion */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Todas las Categorias</option>
                <option value="Servidores y Redes">Servidores y Redes</option>
                <option value="Estaciones de Trabajo">Estaciones de Trabajo</option>
                <option value="Almacenamiento Empresarial">Almacenamiento Empresarial</option>
                <option value="Ciberseguridad y Perifericos">Ciberseguridad y Perifericos</option>
              </select>
            </div>
          </div>

          {/* Tabla de Productos con Acciones CRUD */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Producto</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No se encontraron productos registrados con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                              <Image
                                src={prod.imageUrl}
                                alt={prod.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-white truncate">{prod.name}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{prod.category}</td>
                        <td className="p-4 font-mono text-slate-400">{prod.sku}</td>
                        <td className="p-4 font-bold text-white">{formatCurrency(prod.price)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold ${
                              prod.stock <= 0
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : prod.stock <= 5
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {prod.stock} un.
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {prod.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-1.5 rounded-lg border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-colors"
                              title="Editar producto"
                              aria-label={`Editar ${prod.name}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setProductToDelete(prod);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 hover:bg-rose-600/20 transition-colors"
                              title="Eliminar producto"
                              aria-label={`Eliminar ${prod.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTION DE ORDENES */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Numero de Orden</th>
                    <th className="p-4">Cliente / Contacto</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Lineas / Articulos</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado Actual</th>
                    <th className="p-4">Actualizar Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{ord.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{ord.customerName}</p>
                        <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                      </td>
                      <td className="p-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                      <td className="p-4 text-slate-300">
                        {ord.items.length} {ord.items.length === 1 ? "articulo" : "articulos"}
                      </td>
                      <td className="p-4 font-bold text-indigo-400">{formatCurrency(ord.total)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR PRODUCTO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Editar Producto del Catalogo" : "Registrar Nuevo Producto"}
        description="Configure los parametros tecnicos, comerciales y de inventario."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Servidor Rack Nexus R750"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Servidores y Redes">Servidores y Redes</option>
                <option value="Estaciones de Trabajo">Estaciones de Trabajo</option>
                <option value="Almacenamiento Empresarial">Almacenamiento Empresarial</option>
                <option value="Ciberseguridad y Perifericos">Ciberseguridad y Perifericos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Precio Unitario (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="4899.99"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Precio Anterior (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.comparePrice}
                onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                placeholder="5399.99"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Cantidad en Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Codigo SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SRV-NX-750"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Estado del Producto
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "DRAFT" | "ARCHIVED" })}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">Activo en Catalogo</option>
                <option value="DRAFT">Borrador</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              URL de Imagen del Producto *
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              Descripcion Tecnica *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripcion detallada del hardware, casos de uso y certificaciones..."
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">
              Especificaciones Detalladas (Opcional)
            </label>
            <textarea
              rows={2}
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder="CPU, Memoria, Interfaces, Fuentes, etc."
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="featured-checkbox" className="font-semibold text-slate-300 cursor-pointer">
              Destacar producto en la pagina principal
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Registro"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRMACION DE ELIMINACION */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminacion de Producto"
        description="Esta operacion dara de baja el registro seleccionado del catalogo."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Esta seguro de proceder con la eliminacion de{" "}
            <span className="font-bold text-white">
              {productToDelete?.name}
            </span>{" "}
            (SKU: {productToDelete?.sku})?
          </p>
          <p className="text-slate-400">
            Si el producto posee pedidos asociados historicos, sera archivado automaticamente para salvaguardar la coherencia transaccional.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Eliminacion"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
