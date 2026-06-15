import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { StudentSelector } from '../../components/student-selector/student-selector';
import { AuthService } from '../../services/auth.service';
import { HealthService } from '../../services/health.service';
import { RoleContextService } from '../../services/role-context.service';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';
import { TeacherContextService } from '../../services/teacher-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { ParentContextService } from '../../services/parent-context.service';

@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, RouterOutlet, StudentSelector],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly healthService = inject(HealthService);
  private readonly settingsService = inject(SettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly teacherContext = inject(TeacherContextService);
  private readonly studentContext = inject(StudentContextService);
  private readonly parentContext = inject(ParentContextService);

  protected readonly backendOk = signal(true);
  protected readonly backendWarning = signal('');

  ngOnInit(): void {
    this.themeService.loadFromCache();
    const user = this.auth.currentUser();
    if (user) {
      this.settingsService.personal(user.id).subscribe({
        next: (data) => this.themeService.syncFromServer(!!data['tema_oscuro']),
      });
    }

    this.roleContext.whenReady(() => {
      if (this.roleContext.isTeacher()) {
        this.teacherContext.ensureLoaded();
      }
      if (this.roleContext.isStudent()) {
        this.studentContext.ensureLoaded();
      }
      if (this.roleContext.isParent()) {
        this.parentContext.ensureLoaded();
      }
    });
    setTimeout(() => this.checkHealth(), 0);
  }

  private checkHealth(): void {
    this.healthService.check().subscribe({
      next: (health) => {
        if (health.status !== 'ok') {
          this.backendOk.set(false);
          this.backendWarning.set('No se pudo conectar con el backend. Inicie uvicorn en el puerto 8000.');
          return;
        }
        if ((health.anios_academicos ?? 0) === 0) {
          this.backendWarning.set(
            'Base de datos sin catálogos. Ejecute Backend/sql/06_fix_rls_seed_completo.sql en Supabase.',
          );
        }
      },
      error: () => {
        this.backendOk.set(false);
        this.backendWarning.set('Backend no disponible en http://localhost:8000. Ejecute: uv run uvicorn src.main:app --reload');
      },
    });
  }

  protected roleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      DIRECTOR: 'Director(a)',
      TEACHER: 'Docente',
      STUDENT: 'Estudiante',
      PARENT: 'Padre/Madre',
    };
    return labels[role] ?? role;
  }
}
