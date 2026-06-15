import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/seguimiento`;

  listar(params?: Record<string, string>): Observable<unknown[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<unknown[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post<unknown>(this.baseUrl, payload);
  }
}
