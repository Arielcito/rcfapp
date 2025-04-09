# Mercado Pago Integration

This document describes how to use the Mercado Pago integration in the RCF App.

## Configuration

The Mercado Pago integration requires the following environment variables to be set in the `.env` file:

```
MERCADO_PAGO_PUBLIC_KEY=your_public_key
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_CLIENT_ID=your_client_id
MERCADO_PAGO_CLIENT_SECRET=your_client_secret
```

## API Endpoints

### Save Configuration from Environment Variables

This endpoint allows you to save the Mercado Pago configuration from the environment variables for a specific predio.

```
POST /api/mercadopago/config/env/:predioId
```

**Parameters:**
- `predioId`: The ID of the predio to configure

**Response:**
```json
{
  "success": true,
  "data": {
    "predioId": "uuid",
    "publicKey": "APP_USR-...",
    "clientId": "123456789",
    "isTestMode": true,
    "accessToken": "********",
    "clientSecret": "********"
  }
}
```

### Save Custom Configuration

This endpoint allows you to save a custom Mercado Pago configuration for a specific predio.

```
POST /api/mercadopago/config
```

**Request Body:**
```json
{
  "predioId": "uuid",
  "publicKey": "APP_USR-...",
  "accessToken": "APP_USR-...",
  "clientId": "123456789",
  "clientSecret": "your_client_secret",
  "isTestMode": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predioId": "uuid",
    "publicKey": "APP_USR-...",
    "clientId": "123456789",
    "isTestMode": true,
    "accessToken": "********"
  }
}
```

### Get Public Key

This endpoint allows you to get the public key for a specific predio.

```
GET /api/mercadopago/public-key/:predioId
```

**Parameters:**
- `predioId`: The ID of the predio

**Response:**
```json
{
  "success": true,
  "data": {
    "publicKey": "APP_USR-..."
  }
}
```

### Create Payment Preference

This endpoint allows you to create a payment preference for a specific predio.

```
POST /api/mercadopago/create-preference
```

**Request Body:**
```json
{
  "predioId": "uuid",
  "items": [
    {
      "title": "Product Title",
      "description": "Product Description",
      "quantity": 1,
      "currency_id": "ARS",
      "unit_price": 100
    }
  ],
  "external_reference": "reference",
  "back_urls": {
    "success": "https://example.com/success",
    "failure": "https://example.com/failure",
    "pending": "https://example.com/pending"
  },
  "auto_return": "approved",
  "notification_url": "https://example.com/webhook"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "preference_id",
    "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
    "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
  }
}
```

### Get Payment Information

This endpoint allows you to get information about a payment.

```
GET /api/mercadopago/payment/:paymentId/:predioId
```

**Parameters:**
- `paymentId`: The ID of the payment
- `predioId`: The ID of the predio

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment_id",
    "status": "approved",
    "status_detail": "accredited",
    "transaction_amount": 100,
    "currency_id": "ARS",
    "payment_method_id": "credit_card",
    "payment_type_id": "credit_card",
    "external_reference": "reference"
  }
}
```

## Security

The Mercado Pago integration uses encryption to protect sensitive data:

- The access token and client secret are encrypted before being stored in the database.
- The encryption key is derived from the JWT_SECRET environment variable.
- The encryption algorithm used is AES-256-CBC.

## Testing

You can test the Mercado Pago integration using the provided test script:

```bash
node test-mercadopago-config.js
```

Make sure to replace the `predioId` in the script with a valid predio ID. 