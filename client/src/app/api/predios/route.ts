import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("session", session)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    // Validar datos requeridos
    if (!data.nombre || !data.direccion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Preparar datos para crear el predio con ubicación simplificada
    const predioData = {
      usuarioId:  session.user.id,
      nombre: data.nombre,
      direccion: data.direccion,
      ciudad: "Buenos Aires",
      provincia: "Buenos Aires",
      telefono: data.telefono,
      latitud: data.latitud,
      longitud: data.longitud,
      horarioApertura: data.horarioApertura ? data.horarioApertura : null,
      horarioCierre: data.horarioCierre ? data.horarioCierre : null,
      imagenUrl: data.imagenUrl,
    }

    // Crear el predio con sus canchas relacionadas
    const predio = await prisma.predio.create({
      data: {
        ...predioData,
        canchas: {
          create: data.canchas?.map((cancha: { nombre: string, tipo: string, imagenUrl: string }) => ({
            nombre: cancha.nombre,
            tipo: cancha.tipo,
            imagenUrl: cancha.imagenUrl,
          }))
        }
      },
      include: {
        canchas: true
      }
    })
    console.log("7. Predio creado:", JSON.stringify(predio, null, 2))
    return NextResponse.json(predio, { status: 201 })

  } catch (error) {
    console.error('Error al crear predio:', {
      mensaje: error instanceof Error ? error.message : 'Error desconocido',
      tipo: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    })

    const mensajeError = error instanceof Error 
      ? `Error al crear el predio: ${error.message}`
      : 'Error al crear el predio';

    return NextResponse.json(
      { error: mensajeError },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const predios = await prisma.predio.findMany({
      include: {
        canchas: true
      }
    })
    return NextResponse.json(predios)
  } catch (error) {
    console.error('Error al obtener predios:', {
      mensaje: error instanceof Error ? error.message : 'Error desconocido',
      tipo: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { error: 'Error al obtener predios' },
      { status: 500 }
    )
  }
} 