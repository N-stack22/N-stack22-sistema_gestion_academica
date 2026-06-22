import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface AcademicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dni: string;
  role: string;
  roleCode: string;
  roleName: string;
  status: string;
  active: boolean;
  profileId?: string;
  entityType?: string;
  entityCode?: string;
  entityId?: string;
  allRoles?: { code: string; name: string; active: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class AcademicUserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/usuarios`;

  listar(rol?: string): Observable<AcademicUser[]> {
    const q = rol ? `?rol=${rol}` : '';
    return this.http.get<AcademicUser[]>(`${this.baseUrl}${q}`);
  }

  obtener(id: string): Observable<AcademicUser> {
    return this.http.get<AcademicUser>(`${this.baseUrl}/${id}`);
  }

  crear(payload: Record<string, unknown>): Observable<AcademicUser> {
    return this.http.post<AcademicUser>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<AcademicUser> {
    return this.http.put<AcademicUser>(`${this.baseUrl}/${id}`, payload);
  }

  restablecerPassword(id: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id}/password`, {
      new_password: newPassword,
    });
  }
}
