export interface Place {
  banco: string;
  capacidadEstacionamiento: number | null;
  cbu: string;
  ciudad: string;
  codigoPostal: string;
  diasOperacion: string | null;
  direccion: string;
  email: string;
  fechaRegistro: string;
  horarioApertura: string;
  horarioCierre: string;
  id: string;
  imagenUrl: string;
  latitud: string;
  longitud: string;
  nombre: string;
  numeroCuenta: string;
  precioHora: number;
  provincia: string;
  telefono: string;
  tieneCafeteria: boolean | null;
  tieneVestuarios: boolean | null;
  tipoCuenta: string;
  titularCuenta: string;
  usuarioId: string;
}
  