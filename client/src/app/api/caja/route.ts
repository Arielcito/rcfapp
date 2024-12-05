import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const predioId = searchParams.get('predioId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!predioId || !from || !to) {
    return NextResponse.json(
      { error: 'Faltan parámetros requeridos' },
      { status: 400 }
    );
  }

  try {
    // Obtener pagos y reservas del período
    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: {
          gte: new Date(from),
          lte: new Date(to),
        },
        reserva: {
          cancha: {
            predioId: predioId,
          },
        },
      },
      include: {
        reserva: {
          include: {
            cancha: true,
            user: true,
          },
        },
        user: true,
      },
    });

    // Transformar los datos para la tabla
    const movimientos = pagos.map(pago => ({
      id: pago.id,
      concepto: 'Cobro Turno',
      jugador: pago.reserva.user.name || 'Sin nombre',
      usuario: pago.user.name || 'Sistema',
      cancha: pago.reserva.cancha.nombre,
      fechaTurno: pago.reserva.fechaHora,
      fechaMovimiento: pago.fechaPago,
      metodoPago: pago.metodoPago,
      egreso: null,
      ingreso: Number(pago.monto),
    }));

    return NextResponse.json({
      movimientos,
      totales: {
        ingresos: movimientos.reduce((acc, mov) => acc + (mov.ingreso || 0), 0),
        egresos: movimientos.reduce((acc, mov) => acc + (mov.egreso || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching caja data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { concepto, descripcion, monto, tipo, metodoPago, predioId } = body;

    // Crear el movimiento manual
    const movimiento = await prisma.movimientoCaja.create({
      data: {
        concepto,
        descripcion,
        monto: tipo === 'EGRESO' ? -monto : monto,
        metodoPago,
        predioId,
        tipo,
        fechaMovimiento: new Date(),
      },
    });

    return NextResponse.json(movimiento);
  } catch (error) {
    console.error('Error creating movimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 