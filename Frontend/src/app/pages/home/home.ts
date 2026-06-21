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
  protected readonly heroMockFeatures = [
    { value: '3', label: 'niveles educativos', highlight: false },
    { value: '5', label: 'perfiles conectados', highlight: false },
    { value: '24/7', label: 'acceso informativo', highlight: false },
    { value: '360°', label: 'gestión escolar', highlight: true },
  ];

  protected readonly heroFloatCards = [
    {
      icon: 'bi-megaphone-fill',
      title: 'Admisión 2026',
      subtitle: 'Proceso informativo abierto',
      modifier: 'admission',
    },
    {
      icon: 'bi-people-fill',
      title: 'Portal familiar',
      subtitle: 'Seguimiento académico',
      modifier: 'family',
    },
    {
      icon: 'bi-grid-1x2-fill',
      title: 'Gestión digital',
      subtitle: 'Comunicación y reportes',
      modifier: 'digital',
    },
  ];

  protected readonly metrics = [
    { icon: 'bi-award-fill', value: '25+', label: 'años de experiencia', accent: 'yellow' },
    { icon: 'bi-people-fill', value: '850', label: 'estudiantes', accent: 'blue' },
    { icon: 'bi-person-workspace', value: '65', label: 'docentes', accent: 'red' },
    { icon: 'bi-layers-fill', value: '3', label: 'niveles educativos', accent: 'blue' },
  ];

  protected readonly schoolPhotos = [
    {
      label: 'Estudiantes aprendiendo',
      caption: 'Ambiente académico moderno',
      variant: 'learning',
      icon: 'bi-book-fill',
    },
    {
      label: 'Docentes acompañando',
      caption: 'Acompañamiento cercano',
      variant: 'teachers',
      icon: 'bi-person-workspace',
    },
    {
      label: 'Actividades culturales',
      caption: 'Vida escolar Horizonte',
      variant: 'culture',
      icon: 'bi-palette-fill',
    },
    {
      label: 'Comunidad educativa',
      caption: 'Familias conectadas',
      variant: 'community',
      icon: 'bi-people-fill',
    },
    {
      label: 'Tecnología académica',
      caption: 'Innovación digital',
      variant: 'tech',
      icon: 'bi-laptop-fill',
    },
  ];

  protected readonly pillars = [
    {
      icon: 'bi-people-fill',
      title: 'Formación integral',
      text: 'Competencias académicas, socioemocionales y ciudadanas en cada etapa formativa.',
      accent: 'blue',
      featured: false,
    },
    {
      icon: 'bi-lightbulb-fill',
      title: 'Innovación educativa',
      text: 'Metodologías activas, recursos digitales y aprendizaje significativo.',
      accent: 'yellow',
      featured: false,
    },
    {
      icon: 'bi-house-heart-fill',
      title: 'Acompañamiento familiar',
      text: 'Comunicación constante con padres y tutores durante todo el año escolar.',
      accent: 'red',
      featured: false,
    },
    {
      icon: 'bi-laptop-fill',
      title: 'Gestión académica digital',
      text: 'Plataforma HORIZONTE DIGITAL con acceso por roles para toda la comunidad.',
      accent: 'digital',
      featured: true,
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
      text: 'Gestiona matrículas, pensiones, pagos registrados y reportes.',
    },
  ];

  protected readonly levels = [
    {
      name: 'Inicial',
      icon: 'bi-palette-fill',
      ages: '3 a 5 años',
      grades: '3, 4 y 5 años',
      text: 'Estimulación temprana, juego guiado y desarrollo de habilidades sociales.',
      accent: 'inicial',
      photoVariant: 'learning',
    },
    {
      name: 'Primaria',
      icon: 'bi-book-fill',
      ages: '1.° a 6.° grado',
      grades: '6 grados formativos',
      text: 'Bases sólidas en comunicación, matemática, ciencias y formación en valores.',
      accent: 'primaria',
      photoVariant: 'culture',
    },
    {
      name: 'Secundaria',
      icon: 'bi-mortarboard-fill',
      ages: '1.° a 5.° año',
      grades: '5 años de secundaria',
      text: 'Preparación académica, orientación vocacional y liderazgo estudiantil.',
      accent: 'secundaria',
      photoVariant: 'tech',
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
