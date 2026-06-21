import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Resource } from '../interfaces/resource';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/recursos`;

  listar(cursoId?: string, docenteId?: string, estudianteId?: string): Observable<Resource[]> {
    const params = new URLSearchParams();
    if (cursoId) params.set('curso_id', cursoId);
    if (docenteId) params.set('docente_id', docenteId);
    if (estudianteId) params.set('estudiante_id', estudianteId);
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<Resource[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<Resource> {
    return this.http.post<Resource>(this.baseUrl, payload);
  }

  upload(file: File): Observable<{ archivo_url: string; nombre_archivo: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ archivo_url: string; nombre_archivo: string; fileUrl: string }>(
      `${this.baseUrl}/upload`,
      formData,
    );
  }

  archivar(recursoId: string): Observable<Resource> {
    return this.http.post<Resource>(`${this.baseUrl}/${recursoId}/archivar`, {});
  }

  desarchivar(recursoId: string): Observable<Resource> {
    return this.http.post<Resource>(`${this.baseUrl}/${recursoId}/desarchivar`, {});
  }

  actualizar(recursoId: string, payload: Record<string, unknown>): Observable<Resource> {
    return this.http.put<Resource>(`${this.baseUrl}/${recursoId}`, payload);
  }
}
