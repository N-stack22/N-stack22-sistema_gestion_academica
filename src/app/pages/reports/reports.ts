import { Component } from '@angular/core';

interface ReportCard {
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  protected readonly reports: ReportCard[] = [
    {
      title: 'Reporte académico',
      icon: 'bi-journal-text',
      description: 'Resumen simulado de notas, promedios y rendimiento por nivel y grado.',
    },
    {
      title: 'Reporte de asistencia',
      icon: 'bi-calendar-check',
      description: 'Consolidado simulado de asistencia diaria y mensual por sección.',
    },
    {
      title: 'Reporte de pagos',
      icon: 'bi-credit-card',
      description: 'Vista simulada de pensiones, pagos registrados y pendientes.',
    },
    {
      title: 'Reporte de matrículas',
      icon: 'bi-file-earmark-person',
      description: 'Estado simulado de matrículas nuevas, activas y pendientes del año.',
    },
  ];
}
