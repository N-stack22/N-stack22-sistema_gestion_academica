import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/configuracion`;

  institucional(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/institucional`);
  }

  personal(perfilId: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/personal/${perfilId}`);
  }

  guardarPersonal(perfilId: string, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(`${this.baseUrl}/personal/${perfilId}`, payload);
  }

  crearAnio(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.baseUrl}/anios`, payload);
  }

  actualizarAnio(anioId: string, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(`${this.baseUrl}/anios/${anioId}`, payload);
  }

  crearPeriodo(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.baseUrl}/periodos`, payload);
  }

  crearMetodoPago(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.baseUrl}/metodos-pago`, payload);
  }

  actualizarMetodoPago(metodoId: string, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(`${this.baseUrl}/metodos-pago/${metodoId}`, payload);
  }

  crearSeccion(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.baseUrl}/secciones`, payload);
  }

  actualizarSeccion(seccionId: string, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(`${this.baseUrl}/secciones/${seccionId}`, payload);
  }
}
