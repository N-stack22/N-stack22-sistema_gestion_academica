import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/pagos`;

  listar(estudianteId?: string, soloValidos = false, filters?: {
    estado?: string;
    busqueda?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    metodo?: string;
  }): Observable<unknown[]> {
    const params = new URLSearchParams();
    if (estudianteId) params.set('estudiante_id', estudianteId);
    if (soloValidos) params.set('solo_validos', 'true');
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.busqueda) params.set('busqueda', filters.busqueda);
    if (filters?.fechaDesde) params.set('fecha_desde', filters.fechaDesde);
    if (filters?.fechaHasta) params.set('fecha_hasta', filters.fechaHasta);
    if (filters?.metodo) params.set('metodo', filters.metodo);
    const q = params.toString() ? `?${params}` : '';
    return this.http.get<unknown[]>(`${this.baseUrl}${q}`);
  }

  registrar(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post<unknown>(this.baseUrl, payload);
  }

  anular(pagoId: string, motivo?: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/${pagoId}/anular`, { motivo: motivo || undefined });
  }
}
