import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardAlertSeverity } from '../../interfaces/role-dashboard-panel';
import { DashboardApiResponse, DashboardService } from '../../services/dashboard.service';
import { RoleContextService } from '../../services/role-context.service';
import { TeacherDashboardData } from '../../services/teacher-dashboard.service';
import { TeacherContextService } from '../../services/teacher-context.service';
import { StudentDashboardData } from '../../services/student-dashboard.service';
import { StudentContextService } from '../../services/student-context.service';
import { ParentContextService } from '../../services/parent-context.service';

@Component({
  selector: 'app-dashboard',
  imports: [StatCard, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly teacherContext = inject(TeacherContextService);
  private readonly studentContext = inject(StudentContextService);
  protected readonly parentContext = inject(ParentContextService);

  private readonly apiData = signal<DashboardApiResponse | null>(null);
  private readonly teacherData = signal<TeacherDashboardData | null>(null);
  private readonly studentData = signal<StudentDashboardData | null>(null);
  private readonly parentData = signal<StudentDashboardData | null>(null);
  protected readonly loading = signal(false);

  protected readonly panel = computed(() => {
    const role = this.auth.currentUser()?.role ?? 'ADMIN';
    const studentName = this.roleContext.getActiveStudent()?.fullName;
    return this.dashboardService.getRolePanel(
      role,
      this.apiData() ?? undefined,
      this.teacherData() ?? undefined,
      role === 'PARENT' ? this.parentData() ?? undefined : this.studentData() ?? undefined,
      role === 'PARENT' ? studentName : undefined,
    );
  });

  protected readonly noCourses = computed(
    () =>
      this.auth.currentUser()?.role === 'TEACHER' &&
      !this.loading() &&
      (this.teacherData()?.summary?.totalCourses ?? 0) === 0,
  );

  protected readonly noEnrollment = computed(
    () => {
      const role = this.auth.currentUser()?.role;
      if (role === 'STUDENT') {
        return (
          !this.loading() &&
          this.studentData() !== null &&
          !this.studentData()?.hasActiveEnrollment
        );
      }
      if (role === 'PARENT') {
        return (
          !this.loading() &&
          this.parentContext.hasLinkedStudents() &&
          this.parentData() !== null &&
          !this.parentData()?.hasActiveEnrollment
        );
      }
      return false;
    },
  );

  protected readonly noLinkedStudents = computed(
    () =>
      this.auth.currentUser()?.role === 'PARENT' &&
      !this.loading() &&
      this.roleContext.isLoaded() &&
      !this.parentContext.hasLinkedStudents(),
  );

  constructor() {
    effect(() => {
      if (this.auth.currentUser()?.role !== 'PARENT' || !this.roleContext.isReady()) return;
      const estudianteId = this.parentContext.selectedStudentId();
      if (!estudianteId) {
        this.parentData.set(null);
        this.loading.set(false);
        return;
      }
      this.loading.set(this.studentContext.loading());
      const dashboard = this.studentContext.dashboard();
      if (dashboard?.student?.id === estudianteId) {
        this.parentData.set(dashboard);
        if (!this.studentContext.loading()) {
          this.loading.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN' || role === 'DIRECTOR') {
      this.loading.set(true);
      this.dashboardService.obtenerResumen().subscribe({
        next: (data) => {
          this.apiData.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      return;
    }
    if (role === 'TEACHER') {
      this.roleContext.whenReady(() => {
        const teacherId = this.roleContext.getTeacherId();
        if (!teacherId) return;
        this.loading.set(true);
        this.dashboardService.obtenerResumenDocente(teacherId).subscribe({
          next: (data) => {
            this.teacherData.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
      return;
    }
    if (role === 'STUDENT') {
      this.roleContext.whenReady(() => {
        this.studentContext.ensureLoaded();
        const estudianteId = this.roleContext.getStudentId();
        if (!estudianteId) return;
        this.loading.set(true);
        this.dashboardService.obtenerResumenEstudiante(estudianteId).subscribe({
          next: (data) => {
            this.studentData.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
      return;
    }
    if (role === 'PARENT') {
      this.roleContext.whenReady(() => {
        if (!this.parentContext.hasLinkedStudents()) {
          this.loading.set(false);
        }
      });
    }
  }

  protected alertClass(severity: DashboardAlertSeverity): string {
    const classes: Record<DashboardAlertSeverity, string> = {
      danger: 'erp-alert-card--danger',
      warning: 'erp-alert-card--warning',
      info: 'erp-alert-card--info',
    };
    return classes[severity];
  }
}
