import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PurposeCard {
  icon: string;
  title: string;
  text: string;
}

interface ProfileAccess {
  title: string;
  icon: string;
  text: string;
}

interface QuickManual {
  title: string;
  icon: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-platform',
  imports: [RouterLink, NgClass],
  templateUrl: './platform.html',
  styleUrl: './platform.scss',
})
export class Platform {
  protected readonly purposeCards: PurposeCard[] = [
    {
      icon: 'bi-journal-text',
      title: 'Consultar información académica',
      text: 'Accede a notas, horarios, tareas y recursos según tu perfil institucional.',
    },
    {
      icon: 'bi-megaphone-fill',
      title: 'Revisar comunicados institucionales',
      text: 'Mantente informado con avisos oficiales y novedades del colegio.',
    },
    {
      icon: 'bi-graph-up',
      title: 'Acompañar el progreso del estudiante',
      text: 'Familias y docentes pueden seguir el avance escolar de forma organizada.',
    },
    {
      icon: 'bi-folder2-open',
      title: 'Acceder a recursos y tareas',
      text: 'Material de apoyo y actividades disponibles en un solo portal.',
    },
  ];

  protected readonly profileAccess: ProfileAccess[] = [
    {
      title: 'Estudiantes',
      icon: 'bi-mortarboard-fill',
      text: 'Pueden revisar sus notas, horarios, tareas, asistencia y recursos académicos.',
    },
    {
      title: 'Docentes',
      icon: 'bi-person-workspace',
      text: 'Pueden organizar cursos, tareas, asistencia, recursos y seguimiento académico.',
    },
    {
      title: 'Padres de familia',
      icon: 'bi-people-fill',
      text: 'Pueden acompañar el avance académico del estudiante, revisar comunicados, asistencia y pensiones informativas.',
    },
    {
      title: 'Administración',
      icon: 'bi-building-fill-gear',
      text: 'Puede gestionar información institucional, reportes y seguimiento académico de manera organizada.',
    },
  ];

  protected readonly quickManuals: QuickManual[] = [
    {
      title: 'Manual para estudiantes',
      icon: 'bi-mortarboard',
      description: 'Aprende a consultar notas, horarios, tareas y recursos desde tu portal.',
    },
    {
      title: 'Manual para docentes',
      icon: 'bi-easel-fill',
      description: 'Guía para registrar actividades, recursos y seguimiento de tus cursos.',
    },
    {
      title: 'Manual para padres de familia',
      icon: 'bi-people',
      description: 'Orientación para acompañar el progreso académico y revisar comunicados.',
    },
    {
      title: 'Manual para administración',
      icon: 'bi-shield-lock',
      description: 'Referencia de gestión institucional y reportes académicos simulados.',
    },
  ];

  protected readonly securityTips = [
    'No compartir credenciales con otras personas.',
    'Cerrar sesión al terminar de usar la plataforma.',
    'Usar un correo institucional válido asignado por el colegio.',
    'Consultar solo la información correspondiente a tu perfil.',
  ];

  protected readonly faqs: FaqItem[] = [
    {
      question: '¿Cómo ingreso a la plataforma?',
      answer:
        'Desde la opción Ingresar a la intranet en esta página o en el menú principal. Usa las credenciales de prueba según tu rol.',
    },
    {
      question: '¿Qué hago si olvido mi contraseña?',
      answer:
        'En esta versión académica el acceso es simulado. Consulta la tabla de credenciales demo en la página de login o contacta al colegio.',
    },
    {
      question: '¿Los pagos son reales?',
      answer: 'No. Los módulos de pensiones y pagos son informativos y no procesan transacciones reales.',
    },
    {
      question: '¿La información es simulada?',
      answer:
        'Sí. HORIZONTE DIGITAL es un frontend académico con datos referenciales para demostración y aprendizaje.',
    },
    {
      question: '¿Puedo usar la plataforma desde celular?',
      answer:
        'Sí. El portal está diseñado con diseño responsive y puede consultarse desde dispositivos móviles.',
    },
  ];

  protected readonly educationLevels = ['Inicial', 'Primaria', 'Secundaria', 'CEBA'];
}
