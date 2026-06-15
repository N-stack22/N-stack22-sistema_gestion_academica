import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  generar(
    tipo: string,
    params?: Record<string, string>,
  ): Observable<{ tipo: string; total: number; rows: Record<string, unknown>[] }> {
    const q = params && Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<{ tipo: string; total: number; rows: Record<string, unknown>[] }>(
      `${API_BASE_URL}/api/reportes/${tipo}${q}`,
    );
  }
}
