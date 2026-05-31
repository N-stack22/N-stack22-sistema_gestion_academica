import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgClass],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly pillars = [
    {
      icon: 'bi-people-fill',
      title: 'Formación integral',
      text: 'Desarrollamos competencias académicas, socioemocionales y ciudadanas en cada etapa formativa.',
    },
    {
      icon: 'bi-lightbulb-fill',
      title: 'Innovación educativa',
      text: 'Metodologías activas, recursos digitales y espacios que favorecen el aprendizaje significativo.',
    },
    {
      icon: 'bi-house-heart-fill',
      title: 'Acompañamiento familiar',
      text: 'Comunicación constante con padres y tutores para el seguimiento del progreso de nuestros estudiantes.',
    },
    {
      icon: 'bi-laptop-fill',
      title: 'Gestión académica digital',
      text: 'Intranet con acceso por roles para estudiantes, docentes, padres y administración institucional.',
    },
  ];

  protected readonly intranetRoles = [
    { icon: 'bi-person-badge-fill', label: 'Estudiantes', text: 'Notas, horarios, tareas y recursos de aprendizaje.' },
    { icon: 'bi-person-workspace', label: 'Docentes', text: 'Cursos, evaluaciones, asistencia y recursos pedagógicos.' },
    { icon: 'bi-people-fill', label: 'Padres de familia', text: 'Seguimiento académico y comunicación con la institución.' },
    { icon: 'bi-shield-lock-fill', label: 'Administración', text: 'Gestión institucional, reportes y módulos académicos.' },
  ];

  protected readonly featuredNews = [
    {
      category: 'Institucional',
      date: '10 Mar 2026',
      title: 'Inicio del año escolar 2026',
      summary: 'Ceremonia de apertura y actividades de integración para toda la comunidad horizontina.',
    },
    {
      category: 'Académico',
      date: '28 Feb 2026',
      title: 'Feria de ciencias Horizonte',
      summary: 'Proyectos innovadores presentados por estudiantes de primaria y secundaria ante familias.',
    },
    {
      category: 'Reconocimientos',
      date: '15 Feb 2026',
      title: 'Logros destacados en matemática',
      summary: 'Medallas obtenidas en la etapa regional del concurso escolar de matemática.',
    },
  ];
}
