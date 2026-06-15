import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface HealthStatus {
  status: string;
  database: string;
  perfiles?: number;
  anios_academicos?: number;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  check(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${API_BASE_URL}/api/health`);
  }
}
