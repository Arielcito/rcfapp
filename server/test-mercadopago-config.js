const fetch = require('node-fetch');

// Replace with your actual predio ID
const predioId = 'YOUR_PREDIO_ID';
const baseUrl = 'http://localhost:3001/api';

async function testMercadoPagoConfig() {
  try {
    console.log('Testing Mercado Pago config endpoint...');
    
    const response = await fetch(`${baseUrl}/mercadopago/config/env/${predioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your authentication token here if needed
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Mercado Pago config saved successfully!');
    } else {
      console.error('❌ Error saving Mercado Pago config:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing Mercado Pago config:', error);
  }
}

testMercadoPagoConfig(); 