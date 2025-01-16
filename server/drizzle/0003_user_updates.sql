-- Agregar nuevas columnas
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telefono" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "direccion" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Modificar columnas existentes
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;

-- Manejar email_verified
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;

-- Eliminar columnas obsoletas si existen
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_token";
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_reset_token_exp"; 