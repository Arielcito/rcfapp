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
}

export interface UserCreationData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}