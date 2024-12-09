export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
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