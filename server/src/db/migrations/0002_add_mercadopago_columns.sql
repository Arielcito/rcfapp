-- Add client_id and client_secret columns to predio_mercadopago_config table
ALTER TABLE predio_mercadopago_config
ADD COLUMN client_id VARCHAR,
ADD COLUMN client_secret VARCHAR; 