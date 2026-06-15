import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/pagos`;

  listar(estudianteId?: string, soloValidos = false): Observable<unknown[]> {
    const params = new URLSearchParams();
    if (estudianteId) params.set('estudiante_id', estudianteId);
    if (soloValidos) params.set('solo_validos', 'true');
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
