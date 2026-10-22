import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "NEXUS Enterprise Platform | Equipamiento e Infraestructura Tecnologica",
  description: "Plataforma B2B para adquisicion y gestion de infraestructura IT, servidores rack, estaciones de trabajo de alto rendimiento y soluciones de ciberseguridad.",
  keywords: ["servidores", "datacenter", "redes", "workstations", "hardware empresarial", "ciberseguridad"],
  authors: [{ name: "Nexus Enterprise Systems" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
