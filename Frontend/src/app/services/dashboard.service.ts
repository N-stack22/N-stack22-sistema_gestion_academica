import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Role } from '../interfaces/role';
import { RoleDashboardPanel } from '../interfaces/role-dashboard-panel';

import { TeacherDashboardData } from './teacher-dashboard.service';
import { StudentDashboardData } from './student-dashboard.service';

export interface DashboardApiResponse {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeAnnouncements: number;
    pendingPensions: number;
    activeYear: number | null;
  };
  activities: { title: string; description: string; date: string; type: string }[];
  events: { title: string; description: string; date: string; type: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  obtenerResumen(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${API_BASE_URL}/api/dashboard`);
  }

  obtenerResumenDocente(docenteId: string): Observable<TeacherDashboardData> {
    return this.http.get<TeacherDashboardData>(
      `${API_BASE_URL}/api/dashboard/docente?docente_id=${encodeURIComponent(docenteId)}`,
    );
  }

  obtenerResumenEstudiante(estudianteId: string): Observable<StudentDashboardData> {
    return this.http.get<StudentDashboardData>(
      `${API_BASE_URL}/api/dashboard/estudiante?estudiante_id=${encodeURIComponent(estudianteId)}`,
    );
  }

  getRolePanel(
    role: Role,
    data?: DashboardApiResponse,
    teacherData?: TeacherDashboardData,
    studentData?: StudentDashboardData,
    parentStudentName?: string,
  ): RoleDashboardPanel {
    if (role === 'ADMIN' || role === 'DIRECTOR') {
      return this.buildInstitutionalPanel(data);
    }
    if (role === 'TEACHER') {
      return this.buildTeacherPanel(teacherData);
    }
    if (role === 'STUDENT') {
      return this.buildStudentPanel(studentData);
    }
    if (role === 'PARENT') {
      return this.buildParentPanel(studentData, parentStudentName);
    }
    return this.buildInstitutionalPanel(data);
  }

  private buildInstitutionalPanel(data?: DashboardApiResponse): RoleDashboardPanel {
    const s = data?.summary;
    const year = s?.activeYear ?? new Date().getFullYear();
    return {
      title: 'Panel ejecutivo institucional',
      subtitle: `Indicadores reales del año académico ${year}.`,
      theme: 'institutional',
      portalLabel: 'Gestión institucional',
      alertsTitle: 'Alertas importantes',
      eventsTitle: 'Próximos eventos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        { id: 1, title: 'Estudiantes', value: s?.totalStudents ?? 0, description: 'Registrados', icon: 'bi-person-badge-fill', variant: 'primary' },
        { id: 2, title: 'Docentes', value: s?.totalTeachers ?? 0, description: 'Personal docente', icon: 'bi-person-workspace', variant: 'info' },
        { id: 3, title: 'Matrículas', value: s?.totalEnrollments ?? 0, description: `Año ${year}`, icon: 'bi-file-earmark-person-fill', variant: 'success' },
        { id: 4, title: 'Cursos', value: s?.totalCourses ?? 0, description: 'Asignados', icon: 'bi-journal-bookmark-fill', variant: 'success' },
        { id: 5, title: 'Pensiones pend.', value: s?.pendingPensions ?? 0, description: 'Por regularizar', icon: 'bi-cash-stack', variant: 'warning' },
        { id: 6, title: 'Comunicados', value: s?.activeAnnouncements ?? 0, description: 'Publicados', icon: 'bi-megaphone-fill', variant: 'primary' },
      ],
      alerts: [
        { id: 1, title: 'Pensiones pendientes', description: `${s?.pendingPensions ?? 0} registros por revisar.`, icon: 'bi-cash-stack', severity: 'warning' },
        { id: 2, title: 'Matrículas activas', description: `${s?.totalEnrollments ?? 0} estudiantes matriculados.`, icon: 'bi-file-earmark-person', severity: 'info' },
        { id: 3, title: 'Cursos asignados', description: `${s?.totalCourses ?? 0} cursos en el sistema.`, icon: 'bi-journal-bookmark', severity: 'info' },
      ],
      events: (data?.events ?? []).slice(0, 3).map((e, i) => ({
        id: i + 1,
        title: e.title,
        description: e.description,
        date: e.date,
        type: e.type as 'academic' | 'communication' | 'administrative',
      })),
      quickAccess: [
        { label: 'Estudiantes', icon: 'bi-people-fill', route: '/admin/estudiantes' },
        { label: 'Matrículas', icon: 'bi-file-earmark-person-fill', route: '/admin/matriculas' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
        { label: 'Reportes', icon: 'bi-bar-chart-line-fill', route: '/admin/reportes' },
      ],
    };
  }

  private buildTeacherPanel(data?: TeacherDashboardData): RoleDashboardPanel {
    const s = data?.summary;
    const teacher = data?.teacher;
    const specialty = teacher?.specialty || teacher?.position || 'Docente';
    return {
      title: 'Panel ejecutivo docente',
      subtitle: teacher
        ? `${teacher.fullName} · ${specialty}`
        : 'Gestión de cursos, notas, tareas y asistencia.',
      theme: 'teacher',
      portalLabel: 'Gestión docente',
      alertsTitle: 'Resumen académico',
      eventsTitle: 'Mis cursos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Mis cursos',
          value: s?.totalCourses ?? 0,
          description: 'Asignados',
          icon: 'bi-journal-bookmark-fill',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Estudiantes a cargo',
          value: s?.totalStudents ?? 0,
          description: 'Matriculados',
          icon: 'bi-people-fill',
          variant: 'info',
        },
        {
          id: 3,
          title: 'Tareas activas',
          value: s?.activeTasks ?? 0,
          description: 'Publicadas',
          icon: 'bi-clipboard-check',
          variant: 'warning',
        },
        {
          id: 4,
          title: 'Entregas pendientes',
          value: s?.pendingSubmissions ?? 0,
          description: 'Por revisar',
          icon: 'bi-inbox-fill',
          variant: 'warning',
        },
        {
          id: 5,
          title: 'Asistencia de hoy',
          value: s?.attendanceToday ?? 0,
          description: 'Registros',
          icon: 'bi-calendar-check',
          variant: 'success',
        },
        {
          id: 6,
          title: 'Notas registradas',
          value: s?.gradesRegistered ?? 0,
          description: 'En mis cursos',
          icon: 'bi-card-checklist',
          variant: 'success',
        },
      ],
      alerts: (data?.courses ?? []).slice(0, 4).map((c, i) => ({
        id: i + 1,
        title: c.name,
        description: `${c.grade ?? ''} ${c.section ?? ''} · ${c.studentCount ?? 0} estudiantes`.trim(),
        icon: 'bi-journal-bookmark',
        severity: 'info' as const,
      })),
      events: (data?.courses ?? []).slice(0, 3).map((c, i) => ({
        id: i + 1,
        title: c.name,
        description: `Año ${c.year ?? '—'} · Aula ${c.classroom || '—'}`,
        date: String(c.year ?? ''),
        type: 'academic' as const,
      })),
      quickAccess: [
        { label: 'Mis cursos', icon: 'bi-journal-bookmark-fill', route: '/admin/cursos' },
        { label: 'Notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
      ],
    };
  }

  private getTeacherPanel(): RoleDashboardPanel {
    return this.buildTeacherPanel();
  }

  private buildStudentPanel(data?: StudentDashboardData): RoleDashboardPanel {
    const s = data?.summary;
    const st = data?.student;
    const enr = data?.enrollment;
    const subtitle = st
      ? `${st.fullName} · ${enr?.level ?? ''} ${enr?.grade ?? ''} ${enr?.section ?? ''}`.trim()
      : 'Consulta tu información académica.';
    return {
      title: 'Panel ejecutivo estudiante',
      subtitle,
      theme: 'student',
      portalLabel: 'Portal estudiante',
      alertsTitle: 'Mis cursos',
      eventsTitle: 'Próxima clase',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Mis cursos',
          value: s?.totalCourses ?? 0,
          description: 'Asignados',
          icon: 'bi-journal-bookmark-fill',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Promedio actual',
          value: s?.gradesCount ? (s.generalAverage ?? 0) : '—',
          description: 'Ponderado',
          icon: 'bi-card-checklist',
          variant: 'success',
        },
        {
          id: 3,
          title: 'Tareas pendientes',
          value: s?.pendingTasks ?? 0,
          description: 'Por entregar',
          icon: 'bi-clipboard-check',
          variant: 'warning',
        },
        {
          id: 4,
          title: 'Asistencia',
          value: s?.attendanceTotal ? `${s.attendancePercent ?? 0}%` : '—',
          description: `${s?.attendancePresent ?? 0}/${s?.attendanceTotal ?? 0} registros`,
          icon: 'bi-calendar-check',
          variant: 'info',
        },
        {
          id: 5,
          title: 'Año académico',
          value: enr?.year ?? '—',
          description: enr?.enrollmentStatus ?? 'Matrícula',
          icon: 'bi-calendar3',
          variant: 'primary',
        },
        {
          id: 6,
          title: 'Código',
          value: st?.code ?? '—',
          description: 'Estudiante',
          icon: 'bi-person-badge',
          variant: 'info',
        },
      ],
      alerts: (data?.courses ?? []).slice(0, 4).map((c, i) => ({
        id: i + 1,
        title: c.name,
        description: `Docente: ${c.teacher || '—'}`,
        icon: 'bi-journal-bookmark',
        severity: 'info' as const,
      })),
      events: data?.nextClass
        ? [
            {
              id: 1,
              title: data.nextClass.course,
              description: `Aula ${data.nextClass.classroom || '—'}`,
              date: data.nextClass.time,
              type: 'academic' as const,
            },
          ]
        : [],
      quickAccess: [
        { label: 'Mis notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Mi horario', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Mis tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Recursos', icon: 'bi-folder2-open', route: '/admin/recursos' },
      ],
    };
  }

  private buildParentPanel(
    data?: StudentDashboardData,
    studentName?: string,
  ): RoleDashboardPanel {
    const s = data?.summary;
    const enrollment = data?.enrollment;
    const subtitle = studentName
      ? `Seguimiento de ${studentName}${enrollment?.year ? ` · Año ${enrollment.year}` : ''}`
      : 'Seleccione un estudiante asociado para ver el resumen.';
    return {
      title: 'Panel familiar',
      subtitle,
      theme: 'parent',
      portalLabel: 'Portal padre de familia',
      alertsTitle: 'Alertas del estudiante',
      eventsTitle: 'Próxima clase',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Promedio',
          value: s?.generalAverage ?? '—',
          description: 'Notas registradas',
          icon: 'bi-card-checklist',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Asistencia',
          value: s ? `${s.attendancePercent}%` : '—',
          description: 'Del periodo',
          icon: 'bi-calendar-check',
          variant: 'success',
        },
        {
          id: 3,
          title: 'Tareas pendientes',
          value: s?.pendingTasks ?? 0,
          description: 'Por entregar',
          icon: 'bi-clipboard-check',
          variant: 'warning',
        },
        {
          id: 4,
          title: 'Pensiones pend.',
          value: s?.pendingPensions ?? 0,
          description: 'Por regularizar',
          icon: 'bi-cash-stack',
          variant: 'warning',
        },
        {
          id: 5,
          title: 'Cursos',
          value: s?.totalCourses ?? 0,
          description: 'Matriculados',
          icon: 'bi-journal-bookmark',
          variant: 'info',
        },
        {
          id: 6,
          title: 'Notas',
          value: s?.gradesCount ?? 0,
          description: 'Registradas',
          icon: 'bi-graph-up',
          variant: 'info',
        },
      ],
      alerts: [
        ...(s && s.generalAverage > 0 && s.generalAverage < 11
          ? [
              {
                id: 1,
                title: 'Bajo rendimiento',
                description: `Promedio actual: ${s.generalAverage}. Revise las notas del estudiante.`,
                icon: 'bi-exclamation-triangle',
                severity: 'warning' as const,
              },
            ]
          : []),
        ...(s && s.pendingTasks > 0
          ? [
              {
                id: 2,
                title: 'Tareas pendientes',
                description: `${s.pendingTasks} tarea(s) sin entregar.`,
                icon: 'bi-clipboard-check',
                severity: 'info' as const,
              },
            ]
          : []),
        ...(s && (s.pendingPensions ?? 0) > 0
          ? [
              {
                id: 3,
                title: 'Pensiones pendientes',
                description: `${s.pendingPensions} pensión(es) por pagar.`,
                icon: 'bi-cash-stack',
                severity: 'warning' as const,
              },
            ]
          : []),
        ...(data?.lastFollowUpNote
          ? [
              {
                id: 4,
                title: 'Última observación',
                description: data.lastFollowUpNote,
                icon: 'bi-chat-left-text',
                severity: 'info' as const,
              },
            ]
          : []),
      ],
      events: data?.nextClass
        ? [
            {
              id: 1,
              title: data.nextClass.course,
              description: `Aula ${data.nextClass.classroom || '—'} · ${data.nextClass.time}`,
              date: 'Hoy',
              type: 'academic' as const,
            },
          ]
        : [],
      quickAccess: [
        { label: 'Notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Horario', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
      ],
    };
  }
}
