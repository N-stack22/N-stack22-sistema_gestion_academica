import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface Enrollment {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  academicYear: string;
  academicYearId?: string;
  levelId?: string;
  gradeId?: string;
  sectionId?: string;
  level: string;
  grade: string;
  section: string;
  status: string;
  statusCode?: string;
  enrollmentDate: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/matriculas`;

  listar(params?: Record<string, string>): Observable<Enrollment[]> {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return this.http.get<Enrollment[]>(`${this.baseUrl}${q}`);
  }

  crear(payload: Record<string, unknown>): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.baseUrl, payload);
  }

  obtener(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.baseUrl}/${id}`);
  }

  actualizar(id: string, payload: Record<string, unknown>): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.baseUrl}/${id}`, payload);
  }
}
