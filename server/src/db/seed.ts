import { db } from './index';
import { categoriaMovimiento } from './schema';

async function seedCategorias() {
  // Categorías de Gastos
  const gastos = [
    { nombre: 'Servicios', tipo: 'EGRESO' as const, descripcion: 'Gastos de luz, agua, gas, internet' },
    { nombre: 'Mantenimiento', tipo: 'EGRESO' as const, descripcion: 'Limpieza y reparaciones' },
    { nombre: 'Personal', tipo: 'EGRESO' as const, descripcion: 'Sueldos y cargas sociales' },
    { nombre: 'Equipamiento', tipo: 'EGRESO' as const, descripcion: 'Pelotas, redes y equipos' },
    { nombre: 'Marketing', tipo: 'EGRESO' as const, descripcion: 'Publicidad y promoción' },
    { nombre: 'Impuestos', tipo: 'EGRESO' as const, descripcion: 'Impuestos y tasas' },
    { nombre: 'Otros Gastos', tipo: 'EGRESO' as const, descripcion: 'Gastos varios' }
  ];

  // Categorías de Ingresos
  const ingresos = [
    { nombre: 'Reservas', tipo: 'INGRESO' as const, descripcion: 'Ingresos por reservas de canchas' },
    { nombre: 'Alquiler Equipos', tipo: 'INGRESO' as const, descripcion: 'Alquiler de equipamiento deportivo' },
    { nombre: 'Eventos', tipo: 'INGRESO' as const, descripcion: 'Ingresos por eventos especiales' },
    { nombre: 'Otros Ingresos', tipo: 'INGRESO' as const, descripcion: 'Ingresos varios' }
  ];

  try {
    // Insertar categorías
    await db.insert(categoriaMovimiento).values([...gastos, ...ingresos]);
    console.log('✅ Categorías insertadas correctamente');
  } catch (error) {
    console.error('Error al insertar categorías:', error);
  }
}

async function main() {
  console.log('🌱 Iniciando proceso de seed...');
  await seedCategorias();
  console.log('✅ Proceso de seed completado');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error en el proceso de seed:', error);
  process.exit(1);
}); 