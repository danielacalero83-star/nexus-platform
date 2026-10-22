import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "nexus_enterprise_production_jwt_secret_key_default_2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

interface TokenPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  name: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("nexus_token")?.value;

  let session: TokenPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as TokenPayload;
    } catch {
      session = null;
    }
  }

  // Proteccion de rutas administrativas (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(homeUrl);
    }
  }

  // Proteccion de rutas privadas de usuario (/checkout, /orders, /account)
  const isProtectedUserRoute =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/account");

  if (isProtectedUserRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya esta autenticado y navega a /login o /register, redirigir al panel o catalogo
  if ((pathname === "/login" || pathname === "/register") && session) {
    const redirectUrl = session.role === "ADMIN" ? new URL("/admin", request.url) : new URL("/products", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
