ALTER TABLE "canchas" 
ADD COLUMN IF NOT EXISTS "precio" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "requiere_seña" boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "monto_seña" integer NOT NULL DEFAULT 0;

-- Actualizar registros existentes con valores por defecto
UPDATE "canchas"
SET 
    "precio" = 20000,
    "requiere_seña" = true,
    "monto_seña" = 10000
WHERE "precio" = 0; 