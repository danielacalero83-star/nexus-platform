"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Loader2,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, tax, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "TRANSFER" | "CORPORATE_CREDIT">("CREDIT_CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Su carrito esta vacio</h1>
        <p className="text-sm text-slate-400">
          Para realizar una orden de compra, debe seleccionar al menos un producto de nuestro catalogo.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Ir al Catalogo de Equipos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Pantalla de Exito de Orden
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 w-full animate-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Transaccion Procesada con Exito
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Orden de Compra Confirmada
            </h1>
            <p className="text-sm text-slate-300">
              Hemos registrado su pedido corporativo en el sistema contable y de inventarios.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-sm space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Numero de Orden:</span>
              <span className="text-indigo-400 font-bold">{completedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Monto Total Liquidado:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(completedOrder.total)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estado:</span>
              <span className="text-slate-200">Aprobada / En Preparacion</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/orders"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Package className="w-4 h-4" />
              Ver en Mis Pedidos
            </Link>
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
            >
              Continuar en Catalogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Inicio de sesion necesario", "Debe identificarse para registrar la orden.", "warning");
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (!shippingAddress.trim() || shippingAddress.trim().length < 10) {
      showToast("Direccion incompleta", "Por favor ingrese una direccion de entrega completa.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        shippingAddress,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("Error al procesar la orden", data.error || "No se pudo emitir el pedido.", "error");
        return;
      }

      showToast("Orden registrada", `Pedido ${data.order.orderNumber} procesado exitosamente.`, "success");
      clearCart();
      setCompletedOrder({
        orderNumber: data.order.orderNumber,
        total: data.order.total,
      });
    } catch {
      showToast("Error de conexion", "No fue posible comunicarse con el servicio de ordenes.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Checkout y Formalizacion de Orden
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete los datos de envio y confirmacion de pago corporativo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Checkout */}
        <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-6">
          {/* Seccion 1: Datos del Comprador */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Informacion del Destinatario
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Nombre Completo / Razon Social
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Inversiones Tecnologicas S.A."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Correo Electronico de Contacto
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="corporativo@empresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Direccion Exacta de Entrega de Equipamiento
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Calle, numero de edificio, nivel de oficina, departamento, referencias tecnicas para recepcion de carga..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Seccion 2: Metodo de Pago */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Modalidad de Facturacion y Pago
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-5 h-5 mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-white">Tarjeta de Credito</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Visa, Mastercard, Amex</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "TRANSFER"
                    ? "border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Building2 className="w-5 h-5 mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-white">Transferencia SPEI</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Liquidacion Bancaria</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CORPORATE_CREDIT")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === "CORPORATE_CREDIT"
                    ? "border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-white">Credito a 30 Dias</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Sujeto a aprobacion</p>
              </button>
            </div>
          </div>

          {/* Boton de envio */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validando inventario y procesando orden...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirmar y Liquidar Orden ({formatCurrency(total)})</span>
              </>
            )}
          </button>
        </form>

        {/* Resumen Lateral de la Orden */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
          <h2 className="text-base font-bold text-white">
            Resumen de la Orden ({items.length} {items.length === 1 ? "producto" : "productos"})
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400">
                    Cantidad: {item.quantity} un. x {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-indigo-400">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal neto</span>
              <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Impuesto al Valor Agregado (IVA 13%)</span>
              <span className="font-semibold text-slate-200">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Flete asegurado con trazabilidad</span>
              <span className="font-semibold text-slate-200">
                {shipping === 0 ? "Gratuito (Orden > $1,000)" : formatCurrency(shipping)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
              <span>Total a Liquidar</span>
              <span className="text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              Transaccion cifrada con proteccion de inventario en tiempo real.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
