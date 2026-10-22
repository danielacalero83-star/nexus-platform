"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string; // product id
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
  sku: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    stock: number;
    sku: string;
    category: string;
  }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "nexus_enterprise_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { showToast } = useToast();

  // Carga inicial desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("No se pudo cargar el carrito desde almacenamiento local:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Guardado persistente
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Error al persistir el carrito:", e);
      }
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (
      product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        imageUrl: string;
        stock: number;
        sku: string;
        category: string;
      },
      quantity: number = 1
    ) => {
      if (product.stock <= 0) {
        showToast("Inventario agotado", `El producto ${product.name} no cuenta con existencias.`, "warning");
        return;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const currentItem = prev[existingIndex];
          const newQuantity = currentItem.quantity + quantity;

          if (newQuantity > product.stock) {
            showToast(
              "Limite de existencias alcanzado",
              `Solo hay ${product.stock} unidades disponibles en inventario.`,
              "warning"
            );
            return prev;
          }

          const updated = [...prev];
          updated[existingIndex] = {
            ...currentItem,
            quantity: newQuantity,
          };
          showToast("Carrito actualizado", `Se incrementaron las unidades de ${product.name}.`, "success");
          return updated;
        } else {
          if (quantity > product.stock) {
            showToast(
              "Limite de existencias alcanzado",
              `Solo hay ${product.stock} unidades disponibles.`,
              "warning"
            );
            return prev;
          }

          showToast("Producto anadido", `${product.name} fue anadido al carrito.`, "success");
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity,
              stock: product.stock,
              sku: product.sku,
              category: product.category,
            },
          ];
        }
      });
    },
    [showToast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === productId);
        if (item) {
          showToast("Articulo removido", `${item.name} se elimino del carrito.`, "info");
        }
        return prev.filter((i) => i.id !== productId);
      });
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === productId) {
            if (quantity > item.stock) {
              showToast(
                "Stock maximo excedido",
                `La cantidad maxima disponible para ${item.name} es ${item.stock}.`,
                "warning"
              );
              return { ...item, quantity: item.stock };
            }
            return { ...item, quantity };
          }
          return item;
        });
      });
    },
    [removeItem, showToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return Math.round(subtotal * 0.13 * 100) / 100;
  }, [subtotal]);

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal > 1000 ? 0 : 45;
  }, [items.length, subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + tax + shipping) * 100) / 100;
  }, [subtotal, tax, shipping]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        shipping,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe utilizarse dentro de un CartProvider");
  }
  return context;
}
