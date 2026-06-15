import { Role } from './role';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}
