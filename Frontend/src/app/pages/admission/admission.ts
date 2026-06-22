import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-admission',
  imports: [PageHeader, RouterLink],
  templateUrl: './admission.html',
  styleUrl: './admission.scss',
})
export class Admission {
  public readonly steps = [
    { step: '1', title: 'Solicitud de información', text: 'Completa el formulario de contacto o visita nuestras instalaciones.' },
    { step: '2', title: 'Entrevista familiar', text: 'Reunión con la familia para conocer expectativas y presentar la propuesta institucional.' },
    { step: '3', title: 'Evaluación diagnóstica', text: 'Sesión formativa para identificar el nivel de ingreso adecuado del postulante.' },
    { step: '4', title: 'Matrícula', text: 'Entrega de documentación y confirmación de vacante disponible.' },
  ];

  public readonly requirements = [
    'DNI del estudiante',
    'DNI del apoderado',
    'Libreta de notas del grado anterior',
    'Constancia de no adeudo (si proviene de otra institución)',
  ];

  public readonly faqs = [
    {
      question: '¿La admisión en línea confirma la matrícula?',
      answer: 'No. Este sistema es informativo. La matrícula se gestiona presencialmente con el equipo de admisiones.',
    },
    {
      question: '¿Hay vacantes en todos los grados?',
      answer: 'La disponibilidad varía por nivel. Contáctanos para confirmar vacantes en el grado de interés.',
    },
    {
      question: '¿Cuándo inicia el proceso 2026?',
      answer: 'Atendemos solicitudes de lunes a sábado en horario institucional. Consulta fechas en contacto.',
    },
  ];
}
