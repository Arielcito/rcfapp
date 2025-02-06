import { db } from './index';
import { categoriaMovimiento } from './schema';

async function seedCategorias() {
  // Categorías de Gastos
  const gastos = [
    { nombre: 'Servicios', tipo: 'EGRESO', descripcion: 'Gastos de luz, agua, gas, internet' },
    { nombre: 'Mantenimiento', tipo: 'EGRESO', descripcion: 'Limpieza y reparaciones' },
    { nombre: 'Personal', tipo: 'EGRESO', descripcion: 'Sueldos y cargas sociales' },
    { nombre: 'Equipamiento', tipo: 'EGRESO', descripcion: 'Pelotas, redes y equipos' },
    { nombre: 'Marketing', tipo: 'EGRESO', descripcion: 'Publicidad y promoción' },
    { nombre: 'Impuestos', tipo: 'EGRESO', descripcion: 'Impuestos y tasas' },
    { nombre: 'Otros Gastos', tipo: 'EGRESO', descripcion: 'Gastos varios' }
  ];

  // Categorías de Ingresos
  const ingresos = [
    { nombre: 'Reservas', tipo: 'INGRESO', descripcion: 'Ingresos por reservas de canchas' },
    { nombre: 'Alquiler Equipos', tipo: 'INGRESO', descripcion: 'Alquiler de equipamiento deportivo' },
    { nombre: 'Eventos', tipo: 'INGRESO', descripcion: 'Ingresos por eventos especiales' },
    { nombre: 'Otros Ingresos', tipo: 'INGRESO', descripcion: 'Ingresos varios' }
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