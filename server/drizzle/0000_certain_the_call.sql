CREATE TABLE IF NOT EXISTS "predios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"usuario_id" uuid,
	"nombre" text NOT NULL,
	"direccion" text NOT NULL,
	"ciudad" text NOT NULL,
	"provincia" text NOT NULL,
	"codigo_postal" text,
	"telefono" text,
	"email" text,
	"latitud" numeric,
	"longitud" numeric,
	"capacidad_estacionamiento" integer,
	"tiene_vestuarios" boolean,
	"tiene_cafeteria" boolean,
	"horario_apertura" text,
	"horario_cierre" text,
	"dias_operacion" text,
	"imagen_url" text,
	"fecha_registro" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"password" text,
	"password_reset_token" text,
	"password_reset_token_exp" timestamp,
	"role" text DEFAULT 'USER' NOT NULL,
	"predio_trabajo" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_password_reset_token_unique" UNIQUE("password_reset_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predios" ADD CONSTRAINT "predios_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_predio_trabajo_predios_id_fk" FOREIGN KEY ("predio_trabajo") REFERENCES "predios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
