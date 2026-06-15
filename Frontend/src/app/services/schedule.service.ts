import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

import { Schedule } from '../interfaces/schedule';



@Injectable({ providedIn: 'root' })

export class ScheduleService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${API_BASE_URL}/api/horarios`;



  listar(params?: Record<string, string>): Observable<Schedule[]> {

    const q = params ? `?${new URLSearchParams(params)}` : '';

    return this.http.get<Schedule[]>(`${this.baseUrl}${q}`);

  }



  obtener(id: string): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.baseUrl}/${id}`);
  }

  crear(payload: Record<string, unknown>): Observable<Schedule> {

    return this.http.post<Schedule>(this.baseUrl, payload);

  }



  actualizar(id: string, payload: Record<string, unknown>): Observable<Schedule> {

    return this.http.put<Schedule>(`${this.baseUrl}/${id}`, payload);

  }



  eliminar(id: string): Observable<void> {

    return this.http.delete<void>(`${this.baseUrl}/${id}`);

  }

}


