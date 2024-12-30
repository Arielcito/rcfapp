ALTER TABLE "canchas" ADD COLUMN "precio" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "canchas" ADD COLUMN "requiere_seña" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "canchas" ADD COLUMN "monto_seña" integer DEFAULT 0 NOT NULL;