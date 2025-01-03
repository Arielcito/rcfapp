import { pgTable, text, timestamp, uuid, varchar, boolean, integer, decimal, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '../utils/ids';
import { Role } from '../types/user';

// Definir los tipos para las tablas
type UsersTable = ReturnType<typeof pgTable>;
type PrediosTable = ReturnType<typeof pgTable>;

// Crear las tablas con funciones separadas para evitar referencias circulares
const createUsersTable = (): UsersTable => pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  password: text('password'),
  passwordResetToken: text('password_reset_token').unique(),
  passwordResetTokenExp: timestamp('password_reset_token_exp'),
  role: text('role', { enum: [Role.USER, Role.ADMIN, Role.OWNER] }).default(Role.USER).notNull(),
  predioTrabajo: uuid('predio_trabajo').references(() => predios.id),
  createdAt: timestamp('created_at').defaultNow()
});

const createPrediosTable = (): PrediosTable => pgTable('predios', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  usuarioId: uuid('usuario_id').references(() => users.id),
  nombre: text('nombre').notNull(),
  direccion: text('direccion').notNull(),
  ciudad: text('ciudad').notNull(),
  provincia: text('provincia').notNull(),
  codigoPostal: text('codigo_postal'),
  telefono: text('telefono'),
  email: text('email'),
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

// Crear las instancias de las tablas
export const users = createUsersTable();
export const predios = createPrediosTable();
export const canchas = pgTable('canchas', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predio_id').references(() => predios.id),
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

export const movimientosCaja = pgTable('MovimientoCaja', {
  id: uuid('id').primaryKey().$defaultFn(createId),
  predioId: uuid('predioId').notNull().references(() => predios.id),
  concepto: varchar('concepto').notNull(),
  descripcion: text('descripcion'),
  monto: decimal('monto', { precision: 10, scale: 2 }).notNull(),
  tipo: varchar('tipo').notNull(), // INGRESO o EGRESO
  metodoPago: varchar('metodoPago').notNull(),
  fechaMovimiento: timestamp('fechaMovimiento').defaultNow(),
});

// Configurar las relaciones
export const usersRelations = relations(users, ({ many }) => ({
  prediosOwned: many(predios)
}));

export const prediosRelations = relations(predios, ({ one, many }) => ({
  usuario: one(users, {
    fields: [predios.usuarioId],
    references: [users.id]
  }),
  canchas: many(canchas)
}));

export const canchasRelations = relations(canchas, ({ one }) => ({
  predio: one(predios, {
    fields: [canchas.predioId],
    references: [predios.id]
  })
}));    