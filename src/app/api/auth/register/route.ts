import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de registro invalidos.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "La direccion de correo electronico ya se encuentra registrada." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await signJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as "USER" | "ADMIN",
      name: newUser.name,
    });

    const response = NextResponse.json(
      {
        message: "Usuario registrado con exito.",
        user: newUser,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: "nexus_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    return NextResponse.json(
      { error: "Ocurrio un error interno en el servidor." },
      { status: 500 }
    );
  }
}
