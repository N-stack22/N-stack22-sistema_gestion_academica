import { Injectable, signal } from '@angular/core';
import { LoginCredentials } from '../interfaces/login-credentials';
import { User } from '../interfaces/user';

const SESSION_STORAGE_KEY = 'horizonte_session';

interface MockAccount {
  user: User;
  password: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    user: {
      id: 1,
      fullName: 'Administrador Horizonte',
      email: 'admin@horizonte.edu.pe',
      role: 'ADMIN',
    },
    password: 'Admin123',
  },
  {
    user: {
      id: 2,
      fullName: 'María Elena Vargas',
      email: 'director@horizonte.edu.pe',
      role: 'DIRECTOR',
    },
    password: 'Director123',
  },
  {
    user: {
      id: 3,
      fullName: 'Carlos Mendoza',
      email: 'docente@horizonte.edu.pe',
      role: 'TEACHER',
    },
    password: 'Docente123',
  },
  {
    user: {
      id: 4,
      fullName: 'Lucía Torres',
      email: 'estudiante@horizonte.edu.pe',
      role: 'STUDENT',
    },
    password: 'Estudiante123',
  },
  {
    user: {
      id: 5,
      fullName: 'Rosa Quispe',
      email: 'padre@horizonte.edu.pe',
      role: 'PARENT',
    },
    password: 'Padre123',
  },
];

export interface DemoCredential {
  label: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginCredentials): boolean {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;
    const account = MOCK_ACCOUNTS.find(
      (entry) => entry.user.email.toLowerCase() === email && entry.password === password,
    );

    if (account) {
      this.persistSession(account.user);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getDemoCredentials(): DemoCredential[] {
    return MOCK_ACCOUNTS.map((entry) => ({
      label: this.roleLabel(entry.user.role),
      email: entry.user.email,
      password: entry.password,
    }));
  }

  private roleLabel(role: User['role']): string {
    const labels: Record<User['role'], string> = {
      ADMIN: 'Administrador',
      DIRECTOR: 'Director',
      TEACHER: 'Docente',
      STUDENT: 'Estudiante',
      PARENT: 'Padre de familia',
    };
    return labels[role];
  }

  private persistSession(user: User): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const user = JSON.parse(raw) as User;
      const isValid = MOCK_ACCOUNTS.some((entry) => entry.user.email === user?.email);

      if (isValid && user?.email && user?.role) {
        this.currentUserSignal.set(user);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}
