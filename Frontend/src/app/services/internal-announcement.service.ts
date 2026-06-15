import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface InternalAnnouncement {
  id: string;
  title: string;
  content: string;
  audience: string;
  audienceRoleCode?: string;
  status: string;
  date: string;
  fileUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class InternalAnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/comunicados-internos`;

  listar(docenteId?: string, estudianteId?: string): Observable<InternalAnnouncement[]> {
    const params = new URLSearchParams();
    if (docenteId) params.set('docente_id', docenteId);
    if (estudianteId) params.set('estudiante_id', estudianteId);
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<InternalAnnouncement[]>(`${this.baseUrl}${q}`);
  }

  obtener(id: string): Observable<InternalAnnouncement> {
    return this.http.get<InternalAnnouncement>(`${this.baseUrl}/${id}`);
  }

  crear(payload: Record<string, unknown>): Observable<InternalAnnouncement> {
    return this.http.post<InternalAnnouncement>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<InternalAnnouncement> {
    return this.http.put<InternalAnnouncement>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
