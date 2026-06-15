import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { TeacherCourseSummary } from './teacher-context.service';

export interface TeacherDashboardData {
  teacher: {
    id: string;
    code: string;
    fullName: string;
    email: string;
    phone: string;
    specialty: string;
    position: string;
    degree: string;
  };
  summary: {
    totalCourses: number;
    totalStudents: number;
    activeTasks: number;
    pendingSubmissions: number;
    attendanceToday: number;
    gradesRegistered: number;
  };
  courses: TeacherCourseSummary[];
}

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  private readonly http = inject(HttpClient);

  obtenerResumen(docenteId: string): Observable<TeacherDashboardData> {
    return this.http.get<TeacherDashboardData>(
      `${API_BASE_URL}/api/dashboard/docente?docente_id=${encodeURIComponent(docenteId)}`,
    );
  }
}
