import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Course } from '../interfaces/course';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/cursos`;

  listar(params?: { anio_id?: string; docente_id?: string; seccion_id?: string }): Observable<Course[]> {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.http.get<Course[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, payload);
  }

  crearAsignatura(payload: { nombre: string; codigo?: string; area?: string }): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/asignaturas`, payload);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listarAsignaturas(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/asignaturas`);
  }
}
