import bcrypt from "bcrypt";
import { prisma } from "../../libs/prismaDB";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "USER" } = body;

    console.log("📝 Intento de registro:", { name, email, role });

    if (!name || !email || !password) {
      console.log("❌ Error: Campos incompletos");
      return NextResponse.json(
        { message: "Por favor completa todos los campos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Error: Formato de email inválido");
      return NextResponse.json(
        { message: "Por favor ingresa un correo electrónico válido" },
        { status: 400 }
      );
    }

    // Validar longitud de la contraseña
    if (password.length < 6) {
      console.log("❌ Error: Contraseña muy corta");
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    if (role && !Object.values(Role).includes(role as Role)) {
      console.log("❌ Error: Rol inválido");
      return NextResponse.json(
        { message: "Rol de usuario inválido" },
        { status: 400 }
      );
    }

    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      console.log("❌ Error: Email ya registrado");
      return NextResponse.json(
        { message: "Este correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
      },
    });

    console.log("✅ Usuario registrado exitosamente:", { email, role });

    // No devolvemos la contraseña hasheada
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("🔥 Error en el registro:", error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { message: "Este correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
