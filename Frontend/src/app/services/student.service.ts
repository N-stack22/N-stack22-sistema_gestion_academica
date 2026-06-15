import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Student, StudentCreatePayload, StudentUpdatePayload } from '../interfaces/student';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/estudiantes`;

  listar(params?: Record<string, string>): Observable<Student[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<Student[]>(`${this.baseUrl}${q}`);
  }

  obtener(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  crear(payload: StudentCreatePayload): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, payload);
  }

  actualizar(id: string, payload: StudentUpdatePayload): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, payload);
  }
}
