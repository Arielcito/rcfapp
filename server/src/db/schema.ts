import { pgTable, text, timestamp, uuid, varchar, boolean, integer, decimal, uniqueIndex, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '../utils/ids';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role', { enum: ['USER', 'ADMIN', 'OWNER'] }).notNull().default('USER'),
  telefono: text('telefono'),
  direccion: text('direccion'),
  predioTrabajo: uuid('predio_trabajo'),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  googleCalendarEnabled: boolean('google_calendar_enabled').default(false),
  googleAccessToken: text('google_access_token'),
  googleRefreshToken: text('google_refresh_token'),
  googleTokenExpiry: timestamp('google_token_expiry'),
  googleCalendarId: text('google_calendar_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const predios = pgTable('predios', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  usuarioId: uuid('usuario_id'),
  nombre: text('nombre').notNull(),
  direccion: text('direccion').notNull(),
  ciudad: text('ciudad').notNull(),
  provincia: text('provincia').notNull(),
  codigoPostal: text('codigo_postal'),
  telefono: text('telefono'),
  email: text('email'),
  cbu: text('cbu'),
  titularCuenta: text('titular_cuenta'),
  tipoCuenta: text('tipo_cuenta'),
  banco: text('banco'),
  numeroCuenta: text('numero_cuenta'),
  latitud: decimal('latitud'),
  longitud: decimal('longitud'),
  capacidadEstacionamiento: integer('capacidad_estacionamiento'),
  tieneVestuarios: boolean('tiene_vestuarios'),
  tieneCafeteria: boolean('tiene_cafeteria'),
  horarioApertura: text('horario_apertura'),
  horarioCierre: text('horario_cierre'),
  diasOperacion: text('dias_operacion'),
  imagenUrl: text('imagen_url'),
  fechaRegistro: timestamp('fecha_registro').defaultNow()
});

export const deportes = pgTable('deportes', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  nombre: text('nombre').notNull().unique(),
  descripcion: text('descripcion'),
  reglasEspeciales: text('reglas_especiales'),
  equipamientoRequerido: text('equipamiento_requerido'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const canchas = pgTable('canchas', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predio_id').references(() => predios.id),
  deporteId: uuid('deporte_id').references(() => deportes.id),
  nombre: text('nombre').notNull(),
  tipo: text('tipo'),
  capacidadJugadores: integer('capacidad_jugadores'),
  longitud: decimal('longitud'),
  ancho: decimal('ancho'),
  tipoSuperficie: text('tipo_superficie'),
  tieneIluminacion: boolean('tiene_iluminacion'),
  esTechada: boolean('es_techada'),
  precioPorHora: decimal('precio_por_hora', { precision: 10, scale: 2 }),
  estado: text('estado'),
  ultimoMantenimiento: timestamp('ultimo_mantenimiento'),
  equipamientoIncluido: text('equipamiento_incluido'),
  imagenUrl: text('imagen_url'),
  precio: decimal('precio', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  requiereSeña: boolean('requiere_seña').notNull().default(false),
  montoSeña: integer('monto_seña').notNull().default(0),
});

export const reservas = pgTable('Reserva', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  canchaId: uuid('canchaId').notNull().references(() => canchas.id),
  userId: uuid('userId').notNull().references(() => users.id),
  fechaHora: timestamp('fechaHora').notNull(),
  duracion: integer('duracion').notNull(),
  precioTotal: decimal('precioTotal', { precision: 10, scale: 2 }),
  estadoPago: varchar('estadoPago'),
  metodoPago: varchar('metodoPago'),
  fechaReserva: timestamp('fechaReserva').defaultNow(),
  notasAdicionales: text('notasAdicionales'),
  pagoId: uuid('pagoId').unique(),
});

export const pagos = pgTable('Pago', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  reservaId: uuid('reservaId').unique().references(() => reservas.id),
  userId: uuid('userId').notNull().references(() => users.id),
  monto: decimal('monto', { precision: 10, scale: 2 }).notNull(),
  fechaPago: timestamp('fechaPago').defaultNow(),
  metodoPago: varchar('metodoPago').notNull(),
  estadoPago: varchar('estadoPago').notNull(),
  numeroTransaccion: varchar('numeroTransaccion'),
  detallesAdicionales: text('detallesAdicionales'),
});

export const categoriaMovimiento = pgTable('categoria_movimiento', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  nombre: text('nombre').notNull(),
  tipo: text('tipo', { enum: ['INGRESO', 'EGRESO'] }).notNull(),
  descripcion: text('descripcion'),
  activo: boolean('activo').default(true),
});

export const movimientosCaja = pgTable('movimientos_caja', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predio_id').references(() => predios.id),
  categoriaId: uuid('categoria_id').references(() => categoriaMovimiento.id),
  concepto: varchar('concepto').notNull(),
  descripcion: text('descripcion'),
  monto: decimal('monto', { precision: 10, scale: 2 }).notNull(),
  tipo: varchar('tipo', { length: 20 }).notNull(),
  metodoPago: varchar('metodo_pago').notNull(),
  fechaMovimiento: timestamp('fecha_movimiento').defaultNow(),
  comprobante: varchar('comprobante', { length: 255 }),
});

export const predioMercadoPagoConfig = pgTable('predio_mercadopago_config', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predio_id').notNull().references(() => predios.id).unique(),
  accessToken: varchar('access_token').notNull(),
  publicKey: varchar('public_key').notNull(),
  clientId: varchar('client_id'),
  clientSecret: varchar('client_secret'),
  isTestMode: boolean('is_test_mode').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ownerRegistrationRequests = pgTable('owner_registration_requests', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  propertyName: text('property_name').notNull(),
  propertyLocation: text('property_location').notNull(),
  additionalInfo: text('additional_info'),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  processedBy: uuid('processed_by').references(() => users.id),
  notes: text('notes'),
});

export const courtRatings = pgTable('court_ratings', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  userId: uuid('user_id').notNull().references(() => users.id),
  reservaId: uuid('reserva_id').notNull().references(() => reservas.id),
  canchaId: uuid('cancha_id').notNull().references(() => canchas.id),
  rating: integer('rating').notNull(), // 1-5 estrellas
  comment: text('comment'),
  facilityQuality: integer('facility_quality').notNull().default(0),
  cleanliness: integer('cleanliness').notNull().default(0),
  staff: integer('staff').notNull().default(0),
  accessibility: integer('accessibility').notNull().default(0),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserReserva: uniqueIndex('unique_user_reserva').on(table.userId, table.reservaId),
}));

export const serviciosPredio = pgTable('servicios_predio', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  predioId: uuid('predio_id').references(() => predios.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const horariosPredio = pgTable('horarios_predio', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predio_id').references(() => predios.id),
  dia: text('dia').notNull(),
  horaInicio: time('hora_inicio').notNull(),
  horaFin: time('hora_fin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const horariosPredioRelations = relations(horariosPredio, ({ one }) => ({
  predio: one(predios, {
    fields: [horariosPredio.predioId],
    references: [predios.id],
  }),
}));

export const serviciosPredioRelations = relations(serviciosPredio, ({ one }) => ({
  predio: one(predios, {
    fields: [serviciosPredio.predioId],
    references: [predios.id],
  }),
}));

// Configurar las relaciones
export const usersRelations = relations(users, ({ one, many }) => ({
  prediosOwned: many(predios),
  predioTrabajo: one(predios, {
    fields: [users.predioTrabajo],
    references: [predios.id],
  }),
}));

export const prediosRelations = relations(predios, ({ one, many }) => ({
  usuario: one(users, {
    fields: [predios.usuarioId],
    references: [users.id]
  }),
  canchas: many(canchas),
  horarios: many(horariosPredio),
  servicios: many(serviciosPredio),
}));

export const canchasRelations = relations(canchas, ({ one }) => ({
  predio: one(predios, {
    fields: [canchas.predioId],
    references: [predios.id]
  }),
  deporte: one(deportes, {
    fields: [canchas.deporteId],
    references: [deportes.id]
  })
}));

export const deportesRelations = relations(deportes, ({ many }) => ({
  canchas: many(canchas)
}));

export const movimientosCajaRelations = relations(movimientosCaja, ({ one }) => ({
  predio: one(predios, {
    fields: [movimientosCaja.predioId],
    references: [predios.id],
  }),
  categoria: one(categoriaMovimiento, {
    fields: [movimientosCaja.categoriaId],
    references: [categoriaMovimiento.id],
  }),
}));

export const courtRatingsRelations = relations(courtRatings, ({ one }) => ({
  user: one(users, {
    fields: [courtRatings.userId],
    references: [users.id],
  }),
  reserva: one(reservas, {
    fields: [courtRatings.reservaId],
    references: [reservas.id],
  }),
  cancha: one(canchas, {
    fields: [courtRatings.canchaId],
    references: [canchas.id],
  }),
}));

export const reservasRelations = relations(reservas, ({ one }) => ({
  cancha: one(canchas, {
    fields: [reservas.canchaId],
    references: [canchas.id],
  }),
  user: one(users, {
    fields: [reservas.userId],
    references: [users.id],
  }),
  pago: one(pagos, {
    fields: [reservas.pagoId],
    references: [pagos.id],
  }),
  courtRating: one(courtRatings, {
    fields: [reservas.id],
    references: [courtRatings.reservaId],
  }),
}));    