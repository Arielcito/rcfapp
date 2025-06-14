import { seedHorariosYServicios } from './horarios-servicios';

async function main() {
  try {
    console.log('🌱 Starting seed process...');
    
    await seedHorariosYServicios();
    
    console.log('✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main(); 