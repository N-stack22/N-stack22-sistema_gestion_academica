import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RoleModule {
  title: string;
  icon: string;
  items: string[];
}

interface FlowStep {
  step: string;
  title: string;
  text: string;
}

interface BenefitItem {
  icon: string;
  title: string;
  text: string;
}

interface FloatingModule {
  icon: string;
  label: string;
  className: string;
}

@Component({
  selector: 'app-platform',
  imports: [RouterLink, NgClass],
  templateUrl: './platform.html',
  styleUrl: './platform.scss',
})
export class Platform {
  protected readonly floatingModules: FloatingModule[] = [
    { icon: 'bi-journal-check', label: 'Notas', className: 'platform-float--notes' },
    { icon: 'bi-calendar-week', label: 'Horarios', className: 'platform-float--schedule' },
    { icon: 'bi-clipboard-check', label: 'Asistencia', className: 'platform-float--attendance' },
    { icon: 'bi-cash-coin', label: 'Pensiones', className: 'platform-float--pensions' },
    { icon: 'bi-megaphone', label: 'Comunicados', className: 'platform-float--announcements' },
  ];

  protected readonly roles: RoleModule[] = [
    {
      title: 'Estudiantes',
      icon: 'bi-mortarboard-fill',
      items: ['Consulta de notas', 'Horarios', 'Tareas', 'Recursos', 'Asistencia'],
    },
    {
      title: 'Docentes',
      icon: 'bi-person-workspace',
      items: ['Gestión de cursos', 'Registro de tareas', 'Seguimiento de asistencia', 'Recursos académicos'],
    },
    {
      title: 'Padres de familia',
      icon: 'bi-people-fill',
      items: ['Seguimiento académico', 'Pensiones informativas', 'Pagos registrados', 'Comunicados'],
    },
    {
      title: 'Administración',
      icon: 'bi-building-fill-gear',
      items: ['Estudiantes', 'Docentes', 'Matrículas', 'Reportes', 'Pensiones'],
    },
  ];

  protected readonly flowSteps: FlowStep[] = [
    {
      step: '1',
      title: 'El colegio centraliza información',
      text: 'Datos académicos e institucionales organizados en un solo ecosistema digital.',
    },
    {
      step: '2',
      title: 'Los docentes actualizan avances',
      text: 'Cursos, tareas, asistencia y recursos disponibles para la comunidad.',
    },
    {
      step: '3',
      title: 'Las familias consultan seguimiento',
      text: 'Padres acceden a notas, horarios, pensiones informativas y comunicados oficiales.',
    },
    {
      step: '4',
      title: 'La administración toma decisiones',
      text: 'Reportes, matrículas y gestión visual para la dirección institucional.',
    },
  ];

  protected readonly benefits: BenefitItem[] = [
    { icon: 'bi-chat-square-text-fill', title: 'Comunicación más clara', text: 'Comunicados y avisos accesibles para toda la comunidad.' },
    { icon: 'bi-graph-up-arrow', title: 'Seguimiento académico oportuno', text: 'Notas, asistencia y tareas visibles según el rol del usuario.' },
    { icon: 'bi-folder2-open', title: 'Información organizada', text: 'Módulos estructurados como un ERP escolar moderno.' },
    { icon: 'bi-heart-fill', title: 'Mejor experiencia para las familias', text: 'Portal apoderado con seguimiento del progreso estudiantil.' },
    { icon: 'bi-bar-chart-fill', title: 'Gestión administrativa visual', text: 'Dashboard ejecutivo y reportes para administración.' },
  ];

  protected readonly securityPoints = [
    'Acceso privado por roles',
    'Backend FastAPI y base de datos Supabase',
    'Sin pagos reales ni procesamiento financiero',
    'Usuarios internos creados por administración',
  ];
}
