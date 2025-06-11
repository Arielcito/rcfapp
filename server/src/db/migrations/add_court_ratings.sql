-- Crear tabla court_ratings para calificaciones de canchas
CREATE TABLE IF NOT EXISTS "court_ratings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"reserva_id" uuid NOT NULL,
	"cancha_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"facility_quality" integer DEFAULT 0 NOT NULL,
	"cleanliness" integer DEFAULT 0 NOT NULL,
	"staff" integer DEFAULT 0 NOT NULL,
	"accessibility" integer DEFAULT 0 NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Agregar foreign keys
DO $$ BEGIN
 ALTER TABLE "court_ratings" ADD CONSTRAINT "court_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "court_ratings" ADD CONSTRAINT "court_ratings_reserva_id_Reserva_id_fk" FOREIGN KEY ("reserva_id") REFERENCES "Reserva"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "court_ratings" ADD CONSTRAINT "court_ratings_cancha_id_canchas_id_fk" FOREIGN KEY ("cancha_id") REFERENCES "canchas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Crear índice único para evitar calificaciones duplicadas por usuario y reserva
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_reserva" ON "court_ratings" ("user_id","reserva_id"); 