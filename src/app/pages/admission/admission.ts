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
  protected readonly steps = [
    { step: '1', title: 'Solicitud de información', text: 'Completa el formulario de contacto o visita nuestras instalaciones.' },
    { step: '2', title: 'Entrevista familiar', text: 'Reunión con la familia para conocer expectativas y presentar la propuesta institucional.' },
    { step: '3', title: 'Evaluación diagnóstica', text: 'Sesión formativa para identificar el nivel de ingreso adecuado del postulante.' },
    { step: '4', title: 'Matrícula', text: 'Entrega de documentación y confirmación de vacante disponible.' },
  ];

  protected readonly requirements = [
    'DNI del estudiante',
    'DNI del apoderado',
    'Libreta de notas del grado anterior',
    'Constancia de no adeudo (si proviene de otra institución)',
  ];
}
