"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  product?: {
    id: string;
    imageUrl: string;
    sku: string;
  };
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error("Error al cargar pedidos:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completada
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            En Proceso
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            <Truck className="w-3.5 h-3.5" />
            En Transito
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Trazabilidad Operativa</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Historial de Pedidos y Adquisiciones
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Consulte el estado de despacho, facturacion y detalle de equipos solicitados.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm">Consultando registros de adquisiciones...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No posee ordenes registradas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cuando genere una orden desde el catalogo, podra monitorear aqui su estatus contable y de transporte.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Ir al Catalogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
            >
              {/* Encabezado de la Orden */}
              <div className="p-5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Numero de Orden</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha de Registro</span>
                    <span className="font-semibold text-slate-300">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Metodo de Pago</span>
                    <span className="font-semibold text-slate-300">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}
                  <span className="text-base font-extrabold text-indigo-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Items de la orden */}
              <div className="p-5 space-y-4">
                <div className="divide-y divide-slate-800/60">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {item.product?.imageUrl && (
                          <div className="relative w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Cantidad: {item.quantity} un. x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-200">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-2">
                  <p>
                    <span className="text-slate-500">Direccion de Envio: </span>
                    {order.shippingAddress}
                  </p>
                  <p className="text-right">
                    <span>Subtotal: {formatCurrency(order.subtotal)} | IVA: {formatCurrency(order.tax)} | Flete: {formatCurrency(order.shippingCost)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
