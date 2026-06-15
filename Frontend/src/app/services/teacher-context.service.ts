import { Injectable, computed, inject, signal } from '@angular/core';
import { RoleContextService } from './role-context.service';
import { TeacherDashboardService, TeacherDashboardData } from './teacher-dashboard.service';

export interface TeacherCourseSummary {
  id: string;
  name: string;
  code?: string;
  level?: string;
  grade?: string;
  section?: string;
  year?: number | string;
  classroom?: string;
  studentCount?: number;
}

@Injectable({ providedIn: 'root' })
export class TeacherContextService {
  private readonly roleContext = inject(RoleContextService);
  private readonly dashboardService = inject(TeacherDashboardService);

  private readonly dashboardData = signal<TeacherDashboardData | null>(null);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly teacherId = computed(() => this.roleContext.getTeacherId());
  readonly isTeacher = computed(() => this.roleContext.isTeacher());
  readonly courses = computed<TeacherCourseSummary[]>(() => {
    const fromApi = this.dashboardData()?.courses;
    if (fromApi?.length) return fromApi;
    return this.roleContext.getTeacherCourses().map((c) => ({ id: c.id, name: c.name }));
  });
  readonly teacherProfile = computed(() => this.dashboardData()?.teacher ?? null);
  readonly dashboardSummary = computed(() => this.dashboardData()?.summary ?? null);

  ensureLoaded(): void {
    if (!this.isTeacher()) return;
    this.roleContext.whenReady(() => {
      const id = this.teacherId();
      if (!id || this.dashboardData()) return;
      this.loading.set(true);
      this.error.set('');
      this.dashboardService.obtenerResumen(id).subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el contexto del docente.');
          this.loading.set(false);
        },
      });
    });
  }

  reset(): void {
    this.dashboardData.set(null);
    this.loading.set(false);
    this.error.set('');
  }

  canAccessCourse(courseId: string | null | undefined): boolean {
    if (!courseId || !this.isTeacher()) return true;
    return this.courses().some((c) => c.id === courseId);
  }

  courseIds(): string[] {
    return this.courses().map((c) => c.id);
  }
}
