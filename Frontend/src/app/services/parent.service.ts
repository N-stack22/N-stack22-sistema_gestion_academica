import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Parent } from '../interfaces/parent';

export interface ParentCreatePayload {
  nombres: string;
  apellidos: string;
  correo_institucional: string;
  dni?: string;
  telefono?: string;
  ocupacion?: string;
  direccion?: string;
  estudiante_id?: string;
  parentesco?: string;
  es_principal?: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class ParentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/apoderados`;

  listar(filters?: {
    busqueda?: string;
    parentesco?: string;
    estado?: string;
  }): Observable<Parent[]> {
    const params = new URLSearchParams();
    if (filters?.busqueda) params.set('busqueda', filters.busqueda);
    if (filters?.parentesco) params.set('parentesco', filters.parentesco);
    if (filters?.estado) params.set('estado', filters.estado);
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<Parent[]>(`${this.baseUrl}${q}`);
  }

  obtener(id: string): Observable<Parent> {
    return this.http.get<Parent>(`${this.baseUrl}/${id}`);
  }

  crear(payload: ParentCreatePayload): Observable<Parent> {
    return this.http.post<Parent>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: Partial<ParentCreatePayload> & { estado?: boolean }): Observable<Parent> {
    return this.http.put<Parent>(`${this.baseUrl}/${id}`, payload);
  }

  vincular(apoderadoId: string, payload: { estudiante_id: string; parentesco: string; es_principal?: boolean }): Observable<Parent> {
    return this.http.post<Parent>(`${this.baseUrl}/${apoderadoId}/vinculos`, payload);
  }
}
