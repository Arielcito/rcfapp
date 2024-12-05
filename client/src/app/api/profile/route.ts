import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el predio del usuario con sus canchas
    const predio = await prisma.predio.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        canchas: true,
        imagenes: true
      }
    });

    return NextResponse.json(predio);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener datos del perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    const updatedPredio = await prisma.predio.update({
      where: {
        id: data.id,
        usuarioId: session.user.id // Verificación de seguridad
      },
      data: {
        nombre: data.nombre,
        direccion: data.direccion,
        ciudad: data.ciudad,
        provincia: data.provincia,
        codigoPostal: data.codigoPostal,
        telefono: data.telefono,
        email: data.email,
        horarioApertura: data.horarioApertura,
        horarioCierre: data.horarioCierre,
        tieneVestuarios: data.tieneVestuarios,
        tieneCafeteria: data.tieneCafeteria,
        imagenUrl: data.imagenUrl
      }
    });

    return NextResponse.json(updatedPredio);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
} 