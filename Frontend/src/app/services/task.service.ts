import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Task, TaskSubmission } from '../interfaces/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/tareas`;

  listar(params?: Record<string, string>): Observable<Task[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<Task[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, payload);
  }

  listarEntregas(tareaId: string, docenteId?: string): Observable<TaskSubmission[]> {
    const q = docenteId ? `?docente_id=${encodeURIComponent(docenteId)}` : '';
    return this.http.get<TaskSubmission[]>(`${this.baseUrl}/${tareaId}/entregas${q}`);
  }

  calificarEntrega(
    entregaId: string,
    payload: { nota?: number; retroalimentacion?: string; estado_codigo?: string; docente_id?: string },
  ): Observable<TaskSubmission> {
    return this.http.put<TaskSubmission>(`${this.baseUrl}/entregas/${entregaId}`, payload);
  }

  registrarEntrega(
    tareaId: string,
    payload: { estudiante_id: string; descripcion?: string; archivo_url?: string },
  ): Observable<TaskSubmission> {
    return this.http.post<TaskSubmission>(`${this.baseUrl}/${tareaId}/entregas`, payload);
  }
}
