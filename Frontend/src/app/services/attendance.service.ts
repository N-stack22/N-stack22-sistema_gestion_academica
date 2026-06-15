import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Attendance } from '../interfaces/attendance';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/asistencia`;

  listar(params?: Record<string, string>): Observable<Attendance[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<Attendance[]>(`${this.baseUrl}${q}`);
  }

  registrar(payload: Record<string, unknown>): Observable<Attendance> {
    return this.http.post<Attendance>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.baseUrl}/${id}`, payload);
  }
}
