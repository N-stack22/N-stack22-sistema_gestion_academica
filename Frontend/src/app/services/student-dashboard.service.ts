import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface StudentEnrollment {
  matricula_id?: string;
  seccion_id?: string;
  anio_academico_id?: string;
  section?: string;
  grade?: string;
  level?: string;
  year?: number;
  enrollmentStatus?: string;
  enrollmentDate?: string;
}

export interface StudentDashboardData {
  student: {
    id: string;
    code: string;
    fullName: string;
    email: string;
    phone: string;
    dni: string;
  };
  enrollment: StudentEnrollment | null;
  summary: {
    totalCourses: number;
    generalAverage: number;
    gradesCount: number;
    pendingTasks: number;
    pendingPensions?: number;
    attendancePercent: number;
    attendancePresent: number;
    attendanceTotal: number;
  };
  courses: { id: string; name: string; teacher: string }[];
  nextClass: { time: string; course: string; classroom: string } | null;
  lastFollowUpNote?: string;
  hasActiveEnrollment: boolean;
}

@Injectable({ providedIn: 'root' })
export class StudentDashboardService {
  private readonly http = inject(HttpClient);

  obtenerResumen(estudianteId: string): Observable<StudentDashboardData> {
    return this.http.get<StudentDashboardData>(
      `${API_BASE_URL}/api/dashboard/estudiante?estudiante_id=${encodeURIComponent(estudianteId)}`,
    );
  }
}
