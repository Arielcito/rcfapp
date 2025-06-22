import { Predio } from "./predio";

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  password?: string;
  role: Role;
  emailVerified?: Date | null;
  image?: string | null;
  passwordResetToken?: string | null;
  passwordResetTokenExp?: Date | null;
  telefono?: string | null;
  predioTrabajo?: string | null;
}

export interface UserCreationData {
  name: string;
  email: string;
  password: string;
  role?: Role;
  telefono?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  telefono?: string;
  image?: string;
}