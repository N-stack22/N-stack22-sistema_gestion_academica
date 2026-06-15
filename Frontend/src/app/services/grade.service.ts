import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Grade } from '../interfaces/grade';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/calificaciones`;

  listar(params?: Record<string, string>): Observable<Grade[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<Grade[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<Grade> {
    return this.http.post<Grade>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<Grade> {
    return this.http.put<Grade>(`${this.baseUrl}/${id}`, payload);
  }
}
