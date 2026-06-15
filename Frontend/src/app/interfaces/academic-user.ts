import { Role } from './role';

export interface AcademicUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  status: 'Activo' | 'Inactivo';
}
