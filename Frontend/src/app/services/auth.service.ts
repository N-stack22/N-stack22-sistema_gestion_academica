import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { LoginCredentials } from '../interfaces/login-credentials';
import { AuthSession, User } from '../interfaces/user';

const SESSION_STORAGE_KEY = 'horizonte_session';

interface LoginResponse {
  id: string;
  fullName: string;
  email: string;
  role: User['role'];
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSignal = signal<User | null>(null);
  private accessToken: string | null = null;

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, credentials).pipe(
      map((response) => this.toSession(response)),
      tap((session) => this.persistSession(session)),
      map((session) => session.user),
    );
  }

  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_BASE_URL}/api/auth/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  private toSession(response: LoginResponse): AuthSession {
    return {
      user: {
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      },
      accessToken: response.accessToken,
    };
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.currentUserSignal.set(session.user);
    this.accessToken = session.accessToken;
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session?.user?.email && session?.user?.role && session?.accessToken) {
        this.currentUserSignal.set(session.user);
        this.accessToken = session.accessToken;
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
}
