CREATE TABLE IF NOT EXISTS "canchas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"predio_id" uuid,
	"nombre" text NOT NULL,
	"tipo" text,
	"capacidad_jugadores" integer,
	"longitud" numeric,
	"ancho" numeric,
	"tipo_superficie" text,
	"tiene_iluminacion" boolean,
	"es_techada" boolean,
	"precio_por_hora" numeric(10, 2),
	"estado" text,
	"ultimo_mantenimiento" timestamp,
	"equipamiento_incluido" text,
	"imagen_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MovimientoCaja" (
	"id" uuid PRIMARY KEY NOT NULL,
	"predioId" uuid NOT NULL,
	"concepto" varchar NOT NULL,
	"descripcion" text,
	"monto" numeric(10, 2) NOT NULL,
	"tipo" varchar NOT NULL,
	"metodoPago" varchar NOT NULL,
	"fechaMovimiento" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Pago" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reservaId" uuid,
	"userId" uuid NOT NULL,
	"monto" numeric(10, 2) NOT NULL,
	"fechaPago" timestamp DEFAULT now(),
	"metodoPago" varchar NOT NULL,
	"estadoPago" varchar NOT NULL,
	"numeroTransaccion" varchar,
	"detallesAdicionales" text,
	CONSTRAINT "Pago_reservaId_unique" UNIQUE("reservaId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Reserva" (
	"id" uuid PRIMARY KEY NOT NULL,
	"canchaId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"fechaHora" timestamp NOT NULL,
	"duracion" integer NOT NULL,
	"precioTotal" numeric(10, 2),
	"estadoPago" varchar,
	"metodoPago" varchar,
	"fechaReserva" timestamp DEFAULT now(),
	"notasAdicionales" text,
	"pagoId" uuid,
	CONSTRAINT "Reserva_pagoId_unique" UNIQUE("pagoId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canchas" ADD CONSTRAINT "canchas_predio_id_predios_id_fk" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_predioId_predios_id_fk" FOREIGN KEY ("predioId") REFERENCES "predios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Pago" ADD CONSTRAINT "Pago_reservaId_Reserva_id_fk" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Pago" ADD CONSTRAINT "Pago_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_canchaId_canchas_id_fk" FOREIGN KEY ("canchaId") REFERENCES "canchas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
