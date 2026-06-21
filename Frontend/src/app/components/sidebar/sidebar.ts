import { Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { TeacherContextService } from '../../services/teacher-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { Role } from '../../interfaces/role';

interface SidebarLink {
  label: string;
  icon: string;
  route: string;
}

interface SidebarGroup {
  title: string;
  links: SidebarLink[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly navigate = output<void>();

  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);
  private readonly teacherContext = inject(TeacherContextService);
  private readonly parentContext = inject(ParentContextService);

  private readonly institutionalGroups: SidebarGroup[] = [
    {
      title: 'General',
      links: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Perfil', icon: 'bi-person-circle', route: '/admin/perfil' },
      ],
    },
    {
      title: 'Gestión académica',
      links: [
        { label: 'Estudiantes', icon: 'bi-person-badge', route: '/admin/estudiantes' },
        { label: 'Docentes', icon: 'bi-person-workspace', route: '/admin/docentes' },
        { label: 'Padres de familia', icon: 'bi-person-hearts', route: '/admin/padres' },
        { label: 'Usuarios', icon: 'bi-person-gear', route: '/admin/usuarios' },
        { label: 'Cursos', icon: 'bi-journal-bookmark', route: '/admin/cursos' },
        { label: 'Notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Horarios', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Recursos', icon: 'bi-folder2-open', route: '/admin/recursos' },
        { label: 'Asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
        { label: 'Seguimiento padres', icon: 'bi-people', route: '/admin/seguimiento-padres' },
      ],
    },
    {
      title: 'Gestión institucional',
      links: [
        { label: 'Matrículas', icon: 'bi-file-earmark-person', route: '/admin/matriculas' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
        { label: 'Pagos', icon: 'bi-credit-card', route: '/admin/pagos' },
        { label: 'Ventas', icon: 'bi-bag-check', route: '/admin/ventas' },
      ],
    },
    {
      title: 'Comunicación y reportes',
      links: [
        { label: 'Comunicados internos', icon: 'bi-megaphone', route: '/admin/comunicados-internos' },
        { label: 'Reportes', icon: 'bi-bar-chart-line', route: '/admin/reportes' },
      ],
    },
    {
      title: 'Sistema',
      links: [{ label: 'Configuración', icon: 'bi-gear-fill', route: '/admin/configuracion' }],
    },
  ];

  private readonly teacherGroups: SidebarGroup[] = [
    {
      title: 'General',
      links: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Perfil', icon: 'bi-person-circle', route: '/admin/perfil' },
      ],
    },
    {
      title: 'Docencia',
      links: [
        { label: 'Mis cursos', icon: 'bi-journal-bookmark', route: '/admin/cursos' },
        { label: 'Notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Horarios', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Recursos', icon: 'bi-folder2-open', route: '/admin/recursos' },
        { label: 'Asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
        { label: 'Estudiantes', icon: 'bi-person-badge', route: '/admin/estudiantes' },
      ],
    },
    {
      title: 'Comunicación',
      links: [
        { label: 'Comunicados', icon: 'bi-megaphone', route: '/admin/comunicados-internos' },
      ],
    },
  ];

  private readonly studentGroups: SidebarGroup[] = [
    {
      title: 'General',
      links: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Perfil', icon: 'bi-person-circle', route: '/admin/perfil' },
      ],
    },
    {
      title: 'Mi academia',
      links: [
        { label: 'Mis notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Mi horario', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Mis tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Recursos', icon: 'bi-folder2-open', route: '/admin/recursos' },
        { label: 'Mi asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
      ],
    },
    {
      title: 'Comunicación',
      links: [
        { label: 'Comunicados', icon: 'bi-megaphone', route: '/admin/comunicados-internos' },
      ],
    },
  ];

  private readonly parentGroups: SidebarGroup[] = [
    {
      title: 'General',
      links: [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Perfil', icon: 'bi-person-circle', route: '/admin/perfil' },
      ],
    },
    {
      title: 'Seguimiento',
      links: [
        { label: 'Notas del estudiante', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Horario del estudiante', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Tareas pendientes', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
        {
          label: 'Seguimiento académico',
          icon: 'bi-people',
          route: '/admin/seguimiento-padres',
        },
      ],
    },
    {
      title: 'Pagos',
      links: [
        { label: 'Pagos', icon: 'bi-credit-card', route: '/admin/pagos' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
      ],
    },
    {
      title: 'Comunicación',
      links: [
        { label: 'Comunicados', icon: 'bi-megaphone', route: '/admin/comunicados-internos' },
      ],
    },
  ];

  protected readonly portalLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    const labels: Partial<Record<Role, string>> = {
      ADMIN: 'Gestión institucional',
      DIRECTOR: 'Gestión institucional',
      TEACHER: 'Gestión docente',
      STUDENT: 'Portal estudiante',
      PARENT: 'Portal padre de familia',
    };
    return role ? (labels[role] ?? 'Intranet académica') : 'Intranet académica';
  });

  protected readonly groups = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) {
      return [];
    }

    switch (role) {
      case 'ADMIN':
      case 'DIRECTOR':
        return this.institutionalGroups;
      case 'TEACHER':
        return this.teacherGroups;
      case 'STUDENT':
        return this.studentGroups;
      case 'PARENT':
        return this.parentGroups;
      default:
        return [];
    }
  });

  protected logout(): void {
    this.roleContext.reset();
    this.studentContext.reset();
    this.teacherContext.reset();
    this.parentContext.reset();
    this.auth.logout();
    this.router.navigate(['/login']);
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
