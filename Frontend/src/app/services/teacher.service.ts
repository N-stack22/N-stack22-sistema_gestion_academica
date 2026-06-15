import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Teacher } from '../interfaces/teacher';

export interface TeacherCreatePayload {
  nombres: string;
  apellidos: string;
  correo_institucional: string;
  dni?: string;
  telefono?: string;
  especialidad?: string;
  cargo?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/docentes`;

  listar(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.baseUrl);
  }

  obtener(id: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.baseUrl}/${id}`);
  }

  crear(payload: TeacherCreatePayload): Observable<Teacher> {
    return this.http.post<Teacher>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Partial<TeacherCreatePayload> & { estado?: boolean }): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.baseUrl}/${id}`, payload);
  }
}
