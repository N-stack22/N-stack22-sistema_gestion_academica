import { Injectable } from '@angular/core';
import { DashboardMetric } from '../interfaces/dashboard-metric';
import { DashboardSummary } from '../interfaces/dashboard-summary';
import { RecentActivity } from '../interfaces/recent-activity';
import { RoleDashboardPanel } from '../interfaces/role-dashboard-panel';
import { Role } from '../interfaces/role';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  getSummary(): DashboardSummary {
    return {
      totalStudents: 850,
      totalTeachers: 65,
      totalCourses: 42,
      attendanceRate: 94.5,
      pendingTasks: 128,
      activeAnnouncements: 6,
    };
  }

  getMetrics(): DashboardMetric[] {
    const summary = this.getSummary();

    return [
      {
        id: 1,
        title: 'Estudiantes',
        value: summary.totalStudents,
        description: 'Matriculados activos 2026',
        icon: 'bi-person-badge-fill',
        variant: 'primary',
      },
      {
        id: 2,
        title: 'Docentes',
        value: summary.totalTeachers,
        description: 'Personal docente registrado',
        icon: 'bi-person-workspace',
        variant: 'info',
      },
      {
        id: 3,
        title: 'Cursos',
        value: summary.totalCourses,
        description: 'Secciones en el año escolar',
        icon: 'bi-journal-bookmark-fill',
        variant: 'success',
      },
      {
        id: 4,
        title: 'Asistencia',
        value: `${summary.attendanceRate}%`,
        description: 'Promedio institucional del mes',
        icon: 'bi-calendar-check',
        variant: 'warning',
      },
    ];
  }

  getRecentActivities(): RecentActivity[] {
    return [
      {
        id: 1,
        title: 'Registro de notas — 3.° Secundaria',
        description: 'Docente García registró calificaciones del bimestre I.',
        date: '12 Mar 2026',
        type: 'academic',
      },
      {
        id: 2,
        title: 'Comunicado publicado',
        description: 'Cronograma de evaluaciones disponible para familias.',
        date: '11 Mar 2026',
        type: 'communication',
      },
      {
        id: 3,
        title: 'Actualización de horarios',
        description: 'Se ajustó el horario de laboratorio de ciencias.',
        date: '10 Mar 2026',
        type: 'administrative',
      },
      {
        id: 4,
        title: 'Asistencia consolidada',
        description: 'Reporte semanal de asistencia generado para primaria.',
        date: '09 Mar 2026',
        type: 'academic',
      },
      {
        id: 5,
        title: 'Nueva tarea asignada',
        description: 'Matemática — 2.° Secundaria: entrega 18 de marzo.',
        date: '08 Mar 2026',
        type: 'academic',
      },
    ];
  }

  getUpcomingEvents(): RecentActivity[] {
    return [
      {
        id: 1,
        title: 'Evaluación bimestral — Primaria',
        description: 'Semana del 17 al 21 de marzo.',
        date: '17 Mar 2026',
        type: 'academic',
      },
      {
        id: 2,
        title: 'Reunión de padres — Secundaria',
        description: 'Auditorio principal, 18:30 h.',
        date: '20 Mar 2026',
        type: 'communication',
      },
      {
        id: 3,
        title: 'Olimpiada interna de matemática',
        description: 'Participación de 4.° y 5.° secundaria.',
        date: '22 Mar 2026',
        type: 'academic',
      },
      {
        id: 4,
        title: 'Consejo directivo docente',
        description: 'Revisión de indicadores académicos del trimestre.',
        date: '25 Mar 2026',
        type: 'administrative',
      },
    ];
  }

  getRolePanel(role: Role): RoleDashboardPanel {
    switch (role) {
      case 'DIRECTOR':
      case 'ADMIN':
        return this.getInstitutionalPanel();
      case 'TEACHER':
        return this.getTeacherPanel();
      case 'STUDENT':
        return this.getStudentPanel();
      case 'PARENT':
        return this.getParentPanel();
      default:
        return this.getInstitutionalPanel();
    }
  }

  private getInstitutionalPanel(): RoleDashboardPanel {
    const summary = this.getSummary();

    return {
      title: 'Panel ejecutivo institucional',
      subtitle: 'Resumen de indicadores clave y alertas prioritarias de la institución.',
      theme: 'institutional',
      portalLabel: 'Gestión institucional',
      alertsTitle: 'Alertas importantes',
      eventsTitle: 'Próximos eventos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Estudiantes activos',
          value: summary.totalStudents,
          description: 'Matriculados 2026',
          icon: 'bi-person-badge-fill',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Docentes activos',
          value: summary.totalTeachers,
          description: 'Personal docente',
          icon: 'bi-person-workspace',
          variant: 'info',
        },
        {
          id: 3,
          title: 'Matrículas del año',
          value: 812,
          description: 'Proceso 2026',
          icon: 'bi-file-earmark-person-fill',
          variant: 'success',
        },
        {
          id: 4,
          title: 'Pensiones pendientes',
          value: 45,
          description: 'Por regularizar',
          icon: 'bi-cash-stack',
          variant: 'warning',
        },
        {
          id: 5,
          title: 'Asistencia general',
          value: `${summary.attendanceRate}%`,
          description: 'Promedio institucional',
          icon: 'bi-calendar-check',
          variant: 'success',
        },
        {
          id: 6,
          title: 'Comunicados activos',
          value: summary.activeAnnouncements,
          description: 'En intranet',
          icon: 'bi-megaphone-fill',
          variant: 'primary',
        },
      ],
      alerts: [
        {
          id: 1,
          title: 'Pensiones por revisar',
          description: '45 registros pendientes de confirmación administrativa.',
          icon: 'bi-cash-stack',
          severity: 'warning',
        },
        {
          id: 2,
          title: 'Matrículas pendientes',
          description: '12 solicitudes aguardan validación documental.',
          icon: 'bi-file-earmark-person',
          severity: 'danger',
        },
        {
          id: 3,
          title: 'Reporte académico próximo',
          description: 'Entrega del informe bimestral programada para el 25 Mar.',
          icon: 'bi-file-earmark-bar-graph',
          severity: 'info',
        },
      ],
      events: [
        {
          id: 1,
          title: 'Consejo directivo',
          description: 'Sala de juntas — 09:00 h.',
          date: '18 Mar 2026',
          type: 'administrative',
        },
        {
          id: 2,
          title: 'Evaluación bimestral',
          description: 'Inicio del I bimestre en todos los niveles.',
          date: '17 Mar 2026',
          type: 'academic',
        },
        {
          id: 3,
          title: 'Reunión de padres',
          description: 'Secundaria — auditorio principal, 18:30 h.',
          date: '20 Mar 2026',
          type: 'communication',
        },
      ],
      quickAccess: [
        { label: 'Estudiantes', icon: 'bi-people-fill', route: '/admin/estudiantes' },
        { label: 'Matrículas', icon: 'bi-file-earmark-person-fill', route: '/admin/matriculas' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
        { label: 'Reportes', icon: 'bi-bar-chart-line-fill', route: '/admin/reportes' },
      ],
    };
  }

  private getTeacherPanel(): RoleDashboardPanel {
    return {
      title: 'Panel ejecutivo docente',
      subtitle: 'Indicadores de tu jornada académica y pendientes prioritarios.',
      theme: 'teacher',
      portalLabel: 'Gestión docente',
      alertsTitle: 'Alertas importantes',
      eventsTitle: 'Próximos eventos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Cursos asignados',
          value: 4,
          description: 'Secundaria 3.°',
          icon: 'bi-journal-bookmark-fill',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Estudiantes a cargo',
          value: 32,
          description: 'En mis secciones',
          icon: 'bi-person-badge-fill',
          variant: 'info',
        },
        {
          id: 3,
          title: 'Tareas por revisar',
          value: 12,
          description: 'Entregas pendientes',
          icon: 'bi-clipboard-check',
          variant: 'warning',
        },
        {
          id: 4,
          title: 'Asistencia del día',
          value: '28/30',
          description: 'Matemática 3.° A',
          icon: 'bi-calendar-check',
          variant: 'success',
        },
        {
          id: 5,
          title: 'Recursos publicados',
          value: 8,
          description: 'Materiales activos',
          icon: 'bi-folder2-open',
          variant: 'info',
        },
      ],
      alerts: [
        {
          id: 1,
          title: 'Evaluaciones pendientes',
          description: '3 evaluaciones por programar esta quincena.',
          icon: 'bi-calendar-event',
          severity: 'warning',
        },
        {
          id: 2,
          title: 'Tareas por revisar',
          description: '12 entregas aguardan calificación.',
          icon: 'bi-clipboard-check',
          severity: 'danger',
        },
        {
          id: 3,
          title: 'Asistencia incompleta',
          description: '2 estudiantes sin registro en Comunicación 3.° B.',
          icon: 'bi-exclamation-triangle',
          severity: 'info',
        },
      ],
      events: [
        {
          id: 1,
          title: 'Evaluación de Matemática',
          description: '3.° Secundaria A — aula 201.',
          date: '17 Mar 2026',
          type: 'academic',
        },
        {
          id: 2,
          title: 'Reunión pedagógica',
          description: 'Coordinación de área de matemática.',
          date: '22 Mar 2026',
          type: 'administrative',
        },
        {
          id: 3,
          title: 'Entrega de notas',
          description: 'Cierre del I bimestre — plazo 28 Mar.',
          date: '28 Mar 2026',
          type: 'academic',
        },
      ],
      quickAccess: [
        { label: 'Mis cursos', icon: 'bi-journal-bookmark-fill', route: '/admin/cursos' },
        { label: 'Notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Asistencia', icon: 'bi-calendar-check', route: '/admin/asistencia' },
      ],
    };
  }

  private getStudentPanel(): RoleDashboardPanel {
    return {
      title: 'Panel ejecutivo estudiante',
      subtitle: 'Tu resumen académico y actividades próximas.',
      theme: 'student',
      portalLabel: 'Portal estudiante',
      alertsTitle: 'Alertas importantes',
      eventsTitle: 'Próximos eventos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Promedio actual',
          value: '15.2',
          description: 'I Bimestre 2026',
          icon: 'bi-star-fill',
          variant: 'primary',
        },
        {
          id: 2,
          title: 'Tareas pendientes',
          value: 3,
          description: 'Por entregar',
          icon: 'bi-clipboard-check',
          variant: 'warning',
        },
        {
          id: 3,
          title: 'Cursos activos',
          value: 6,
          description: '2° Secundaria A',
          icon: 'bi-journal-bookmark-fill',
          variant: 'info',
        },
        {
          id: 4,
          title: 'Asistencia del mes',
          value: '98%',
          description: 'Marzo 2026',
          icon: 'bi-calendar-check',
          variant: 'success',
        },
        {
          id: 5,
          title: 'Recursos disponibles',
          value: 8,
          description: 'Materiales de apoyo',
          icon: 'bi-folder2-open',
          variant: 'info',
        },
      ],
      alerts: [
        {
          id: 1,
          title: 'Tarea próxima a vencer',
          description: 'Ejercicios de fracciones — entrega 18 Mar.',
          icon: 'bi-clipboard-check',
          severity: 'warning',
        },
        {
          id: 2,
          title: 'Evaluación próxima',
          description: 'Matemática escrita — 17 Mar, aula A-201.',
          icon: 'bi-calendar-event',
          severity: 'danger',
        },
        {
          id: 3,
          title: 'Comunicado importante',
          description: 'Olimpiada interna de matemática — inscripciones abiertas.',
          icon: 'bi-megaphone',
          severity: 'info',
        },
      ],
      events: [
        {
          id: 1,
          title: 'Evaluación bimestral',
          description: 'Matemática — evaluación escrita.',
          date: '17 Mar 2026',
          type: 'academic',
        },
        {
          id: 2,
          title: 'Entrega de proyecto',
          description: 'Ciencias — informe de laboratorio.',
          date: '22 Mar 2026',
          type: 'academic',
        },
        {
          id: 3,
          title: 'Actividad institucional',
          description: 'Olimpiada interna de matemática.',
          date: '25 Mar 2026',
          type: 'communication',
        },
      ],
      quickAccess: [
        { label: 'Mis notas', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Mi horario', icon: 'bi-calendar-week', route: '/admin/horarios' },
        { label: 'Mis tareas', icon: 'bi-clipboard-check', route: '/admin/tareas' },
        { label: 'Recursos', icon: 'bi-folder2-open', route: '/admin/recursos' },
      ],
    };
  }

  private getParentPanel(): RoleDashboardPanel {
    return {
      title: 'Panel ejecutivo padre de familia',
      subtitle: 'Seguimiento académico y estado general de Lucía Torres.',
      theme: 'parent',
      portalLabel: 'Portal padre de familia',
      alertsTitle: 'Alertas importantes',
      eventsTitle: 'Próximos eventos',
      quickAccessTitle: 'Accesos rápidos',
      metrics: [
        {
          id: 1,
          title: 'Estado académico',
          value: 'Bueno',
          description: 'Lucía Torres — 2° A',
          icon: 'bi-graph-up',
          variant: 'success',
        },
        {
          id: 2,
          title: 'Asistencia del estudiante',
          value: '95%',
          description: 'Últimas 4 semanas',
          icon: 'bi-calendar-check',
          variant: 'primary',
        },
        {
          id: 3,
          title: 'Pensiones pendientes',
          value: 1,
          description: 'Abril 2026',
          icon: 'bi-cash-stack',
          variant: 'warning',
        },
        {
          id: 4,
          title: 'Pagos registrados',
          value: 2,
          description: 'Año escolar 2026',
          icon: 'bi-credit-card-fill',
          variant: 'info',
        },
        {
          id: 5,
          title: 'Comunicados nuevos',
          value: 2,
          description: 'Sin leer',
          icon: 'bi-megaphone-fill',
          variant: 'primary',
        },
      ],
      alerts: [
        {
          id: 1,
          title: 'Pensión próxima a vencer',
          description: 'Pensión abril — vencimiento 10 Abr (simulado).',
          icon: 'bi-cash-stack',
          severity: 'warning',
        },
        {
          id: 2,
          title: 'Reunión de padres',
          description: 'Secundaria — 20 Mar, 18:30 h.',
          icon: 'bi-people-fill',
          severity: 'info',
        },
        {
          id: 3,
          title: 'Tarea pendiente del estudiante',
          description: 'Lucía tiene 3 tareas por entregar esta semana.',
          icon: 'bi-clipboard-check',
          severity: 'danger',
        },
      ],
      events: [
        {
          id: 1,
          title: 'Reunión con tutor',
          description: 'Prof. García — seguimiento académico.',
          date: '19 Mar 2026',
          type: 'communication',
        },
        {
          id: 2,
          title: 'Evaluación bimestral',
          description: 'Lucía — evaluación de Matemática.',
          date: '17 Mar 2026',
          type: 'academic',
        },
        {
          id: 3,
          title: 'Actividad institucional',
          description: 'Olimpiada interna — inscripciones abiertas.',
          date: '25 Mar 2026',
          type: 'communication',
        },
      ],
      quickAccess: [
        { label: 'Notas del estudiante', icon: 'bi-card-checklist', route: '/admin/notas' },
        { label: 'Pensiones', icon: 'bi-cash-stack', route: '/admin/pensiones' },
        { label: 'Pagos', icon: 'bi-credit-card', route: '/admin/pagos' },
        { label: 'Seguimiento académico', icon: 'bi-graph-up', route: '/admin/seguimiento-padres' },
      ],
    };
  }
}
