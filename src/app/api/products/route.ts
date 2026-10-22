import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // Construccion de clausula WHERE tipada
    const where: any = {};

    // Busqueda por palabra clave
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { sku: { contains: query } },
        { category: { contains: query } },
      ];
    }

    // Filtro por categoria
    if (category && category !== "ALL") {
      where.category = category;
    }

    // Filtro por estado
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filtro por rango de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        where.price.lte = maxPrice;
      }
    }

    // Filtro por disponibilidad en inventario
    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Ordenamiento
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [products, totalCount, categoriesRaw] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    const categories = categoriesRaw.map((c: any) => c.category);

    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      categories,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar los productos del catalogo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de Administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Los datos del producto son invalidos.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const baseSlug = slugify(data.name);

    // Asegurar unicidad del slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Verificar unicidad del SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "Ya existe un producto registrado con el SKU proporcionado." },
        { status: 409 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        ...data,
        slug: finalSlug,
      },
    });

    return NextResponse.json(
      {
        message: "Producto creado exitosamente en el catalogo.",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el producto." },
      { status: 500 }
    );
  }
}
