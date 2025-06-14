import { db } from '..';
import { horariosPredio, serviciosPredio } from '../schema';

const CANCHA_ID = '6e49a2e1-3de2-4a2d-8b52-61c94c340098';

async function seedHorarios() {
  console.log('🕒 Seeding operating hours...');
  
  const horarios = [
    // Jueves
    {
      dia: 'Jueves',
      horaInicio: '15:00',
      horaFin: '22:00',
      predioId: CANCHA_ID,
    },
    // Viernes
    {
      dia: 'Viernes',
      horaInicio: '15:00',
      horaFin: '22:00',
      predioId: CANCHA_ID,
    },
    // Sábado
    {
      dia: 'Sábado',
      horaInicio: '09:30',
      horaFin: '22:00',
      predioId: CANCHA_ID,
    },
    // Domingo
    {
      dia: 'Domingo',
      horaInicio: '10:00',
      horaFin: '22:00',
      predioId: CANCHA_ID,
    },
  ];

  await db.insert(horariosPredio).values(horarios);
}

async function seedServicios() {
  console.log('🏃‍♂️ Seeding services...');
  
  const servicios = [
    {
      nombre: 'Pickleball',
      descripcion: 'Cancha disponible para jugar Pickleball',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Fútbol',
      descripcion: 'Cancha disponible para jugar Fútbol',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Vóley',
      descripcion: 'Cancha disponible para jugar Vóley',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Metegol',
      descripcion: 'Servicio de Metegol disponible',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Vestuarios',
      descripcion: 'Vestuarios disponibles para los usuarios',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Estacionamiento',
      descripcion: 'Estacionamiento disponible para vehículos',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Bar',
      descripcion: 'Servicio de Bar disponible',
      predioId: CANCHA_ID,
    },
    {
      nombre: 'Clases Particulares',
      descripcion: 'Clases disponibles con profesor individual o en parejas',
      predioId: CANCHA_ID,
    },
  ];

  await db.insert(serviciosPredio).values(servicios);
}

export async function seedHorariosYServicios() {
  try {
    await seedHorarios();
    await seedServicios();
    console.log('✅ Horarios y servicios seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding horarios y servicios:', error);
    throw error;
  }
} 