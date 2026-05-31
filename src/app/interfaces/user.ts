import { Role } from './role';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string;
}
