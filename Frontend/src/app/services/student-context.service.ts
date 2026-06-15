import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { RoleContextService } from './role-context.service';
import { StudentDashboardData, StudentDashboardService } from './student-dashboard.service';

@Injectable({ providedIn: 'root' })
export class StudentContextService {
  private readonly roleContext = inject(RoleContextService);
  private readonly dashboardService = inject(StudentDashboardService);

  private readonly dashboardData = signal<StudentDashboardData | null>(null);
  private loadedForStudentId: string | null = null;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly studentId = computed(() => this.roleContext.getStudentId());
  readonly isStudent = computed(() => this.roleContext.isStudent());
  readonly profile = computed(() => this.dashboardData()?.student ?? null);
  readonly enrollment = computed(() => this.dashboardData()?.enrollment ?? null);
  readonly courses = computed(() => this.dashboardData()?.courses ?? []);
  readonly summary = computed(() => this.dashboardData()?.summary ?? null);
  readonly hasActiveEnrollment = computed(
    () => this.dashboardData()?.hasActiveEnrollment ?? false,
  );
  readonly nextClass = computed(() => this.dashboardData()?.nextClass ?? null);
  readonly dashboard = computed(() => this.dashboardData());

  constructor() {
    effect(() => {
      if (!this.roleContext.requiresStudentScope() || !this.roleContext.isReady()) return;
      const id = this.studentId();
      if (!id) {
        this.dashboardData.set(null);
        this.loadedForStudentId = null;
        return;
      }
      if (this.loadedForStudentId === id && this.dashboardData()) return;
      this.fetchDashboard(id);
    });
  }

  ensureLoaded(): void {
    if (!this.roleContext.requiresStudentScope()) return;
    this.roleContext.whenReady(() => {
      const id = this.studentId();
      if (id) this.fetchDashboard(id);
    });
  }

  reset(): void {
    this.dashboardData.set(null);
    this.loadedForStudentId = null;
    this.loading.set(false);
    this.error.set('');
  }

  private fetchDashboard(studentId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardService.obtenerResumen(studentId).subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loadedForStudentId = studentId;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el contexto del estudiante.');
        this.dashboardData.set(null);
        this.loadedForStudentId = null;
        this.loading.set(false);
      },
    });
  }

  canAccessCourse(courseId: string | null | undefined): boolean {
    if (!courseId || !this.roleContext.requiresStudentScope()) return true;
    return this.courses().some((c) => c.id === courseId);
  }

  courseIds(): string[] {
    return this.courses().map((c) => c.id);
  }
}
