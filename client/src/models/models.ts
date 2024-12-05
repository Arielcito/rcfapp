import type { Role } from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

// Interfaces base para los modelos principales
export interface IUser {
  id: string
  name?: string | null
  email?: string | null
  emailVerified?: Date | null
  image?: string | null
  password?: string | null
  passwordResetToken?: string | null
  passwordResetTokenExp?: Date | null
  role: Role
}

export interface IPredio {
  id: string
  usuarioId: string
  nombre: string
  descripcion: string
  telefono: string
  direccion: string
  ubicacion: {
    lat: number
    lng: number
  }
  horarioApertura: string
  horarioCierre: string
  imagenUrl?: string
  fechaRegistro: Date
}

export interface ICancha {
  id: string
  predioId: string
  nombre: string
  tipo?: string | null
  capacidadJugadores?: number | null
  longitud?: number | null
  ancho?: number | null
  tipoSuperficie?: string | null
  tieneIluminacion?: boolean | null
  esTechada?: boolean | null
  precioPorHora?: number | null
  estado?: string | null
  ultimoMantenimiento?: Date | null
  equipamientoIncluido?: string | null
  imagenUrl?: string | null
  horarioApertura: string
  horarioCierre: string
}

export interface IReserva {
  id: string
  canchaId: string
  userId: string
  fechaHora: Date
  duracion: number
  precioTotal?: Decimal | null
  estadoPago?: string | null
  metodoPago?: string | null
  fechaReserva: Date
  notasAdicionales?: string | null
  pagoId?: string | null
}

export interface IPago {
  id: string
  reservaId: string
  userId: string
  monto: Decimal
  fechaPago: Date
  metodoPago: string
  estadoPago: string
  numeroTransaccion?: string | null
  detallesAdicionales?: string | null
}

// Interfaces para las imágenes
export interface IImagenPredio {
  id: string
  predioId: string
  imagenUrl: string
  descripcion?: string | null
}

export interface IImagenCancha {
  id: string
  canchaId: string
  imagenUrl: string
  descripcion?: string | null
}

// Interfaces para crear nuevos registros (omitiendo IDs y campos autogenerados)
export interface ICreatePredio extends Omit<IPredio, 'id' | 'fechaRegistro'> {}
export interface ICreateCancha extends Omit<ICancha, 'id'> {}
export interface ICreateReserva extends Omit<IReserva, 'id' | 'fechaReserva'> {}
export interface ICreatePago extends Omit<IPago, 'id' | 'fechaPago'> {}
export interface ICreateImagenPredio extends Omit<IImagenPredio, 'id'> {}
export interface ICreateImagenCancha extends Omit<IImagenCancha, 'id'> {}

// Interfaces para actualizar registros (haciendo todos los campos opcionales)
export type IUpdatePredio = Partial<ICreatePredio>
export type IUpdateCancha = Partial<ICreateCancha>
export type IUpdateReserva = Partial<ICreateReserva>
export type IUpdatePago = Partial<ICreatePago>
