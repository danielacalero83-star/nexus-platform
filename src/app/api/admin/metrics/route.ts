import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const [
      totalProducts,
      lowStockCount,
      totalOrders,
      ordersAgg,
      totalUsers,
      recentOrders,
      productsByCategory,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.product.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
    ]);

    const totalRevenue = ordersAgg._sum.total || 0;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
        totalUsers,
      },
      recentOrders,
      productsByCategory,
    });
  } catch (error) {
    console.error("Error al obtener metricas administrativas:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar las metricas administrativas." },
      { status: 500 }
    );
  }
}
