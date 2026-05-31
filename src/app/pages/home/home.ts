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
  protected readonly metrics = [
    { icon: 'bi-award-fill', value: '25+', label: 'años de experiencia' },
    { icon: 'bi-people-fill', value: '850', label: 'estudiantes' },
    { icon: 'bi-person-workspace', value: '65', label: 'docentes' },
    { icon: 'bi-layers-fill', value: '3', label: 'niveles educativos' },
  ];

  protected readonly pillars = [
    {
      icon: 'bi-people-fill',
      title: 'Formación integral',
      text: 'Competencias académicas, socioemocionales y ciudadanas en cada etapa formativa.',
    },
    {
      icon: 'bi-lightbulb-fill',
      title: 'Innovación educativa',
      text: 'Metodologías activas, recursos digitales y aprendizaje significativo.',
    },
    {
      icon: 'bi-house-heart-fill',
      title: 'Acompañamiento familiar',
      text: 'Comunicación constante con padres y tutores durante todo el año escolar.',
    },
    {
      icon: 'bi-laptop-fill',
      title: 'Gestión académica digital',
      text: 'Plataforma HORIZONTE DIGITAL con acceso por roles para toda la comunidad.',
    },
  ];

  protected readonly erpRoles = [
    {
      icon: 'bi-person-badge-fill',
      title: 'Estudiantes',
      text: 'Consultan notas, horarios, tareas y recursos de aprendizaje.',
    },
    {
      icon: 'bi-person-workspace',
      title: 'Docentes',
      text: 'Gestionan cursos, asistencia, evaluaciones y actividades.',
    },
    {
      icon: 'bi-people-fill',
      title: 'Padres de familia',
      text: 'Realizan seguimiento académico y reciben comunicados oficiales.',
    },
    {
      icon: 'bi-shield-lock-fill',
      title: 'Administración',
      text: 'Gestiona matrículas, pensiones, pagos simulados y reportes.',
    },
  ];

  protected readonly levels = [
    {
      name: 'Inicial',
      ages: '3 a 5 años',
      text: 'Estimulación temprana, juego guiado y desarrollo de habilidades sociales.',
      accent: 'inicial',
    },
    {
      name: 'Primaria',
      ages: '1.° a 6.° grado',
      text: 'Bases sólidas en comunicación, matemática, ciencias y formación en valores.',
      accent: 'primaria',
    },
    {
      name: 'Secundaria',
      ages: '1.° a 5.° año',
      text: 'Preparación académica, orientación vocacional y liderazgo estudiantil.',
      accent: 'secundaria',
    },
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
      summary: 'Proyectos innovadores presentados por estudiantes de primaria y secundaria.',
    },
    {
      category: 'Reconocimientos',
      date: '15 Feb 2026',
      title: 'Logros destacados en matemática',
      summary: 'Medallas obtenidas en la etapa regional del concurso escolar de matemática.',
    },
  ];
}
