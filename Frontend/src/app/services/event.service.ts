import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface InstitutionalEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  place?: string;
  audience: string;
  audienceRoleCode?: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/eventos`;

  listar(): Observable<InstitutionalEvent[]> {
    return this.http.get<InstitutionalEvent[]>(this.baseUrl);
  }

  obtener(id: string): Observable<InstitutionalEvent> {
    return this.http.get<InstitutionalEvent>(`${this.baseUrl}/${id}`);
  }

  crear(payload: Record<string, unknown>): Observable<InstitutionalEvent> {
    return this.http.post<InstitutionalEvent>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<InstitutionalEvent> {
    return this.http.put<InstitutionalEvent>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
