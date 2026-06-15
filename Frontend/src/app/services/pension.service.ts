import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Pension {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  level: string;
  grade: string;
  section: string;
  concept: string;
  year: string;
  month: string;
  amount: string;
  dueDate: string;
  status: string;
  statusCode?: string;
}

@Injectable({ providedIn: 'root' })
export class PensionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/pensiones`;

  listar(params?: Record<string, string | number>): Observable<Pension[]> {
    const q = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.http.get<Pension[]>(`${this.baseUrl}${q}`);
  }

  obtener(id: string): Observable<Pension> {
    return this.http.get<Pension>(`${this.baseUrl}/${id}`);
  }

  generar(payload: { anio: number; mes: number; monto: number; seccion_id?: string }): Observable<Pension[]> {
    return this.http.post<Pension[]>(`${this.baseUrl}/generar`, payload);
  }
}
