import { Component } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';

@Component({
  selector: 'app-enrollments',
  imports: [StatCard, DataTable],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.scss',
})
export class Enrollments {
  protected readonly metrics = [
    {
      id: 1,
      title: 'Total matrículas',
      value: 812,
      description: 'Año escolar 2026',
      icon: 'bi-file-earmark-person-fill',
      variant: 'primary' as const,
    },
    {
      id: 2,
      title: 'Matrículas nuevas',
      value: 48,
      description: 'Ingresos recientes',
      icon: 'bi-person-plus-fill',
      variant: 'success' as const,
    },
    {
      id: 3,
      title: 'Matrículas pendientes',
      value: 12,
      description: 'Documentación incompleta',
      icon: 'bi-hourglass-split',
      variant: 'warning' as const,
    },
  ];

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  protected readonly rows: DataTableRow[] = [
    {
      codigo: 'MAT-001',
      estudiante: 'Lucía Torres',
      nivel: 'Secundaria',
      grado: '3°',
      estado: 'Activa',
      fecha: '05 Mar 2026',
    },
    {
      codigo: 'MAT-002',
      estudiante: 'Mateo Rojas',
      nivel: 'Secundaria',
      grado: '3°',
      estado: 'Activa',
      fecha: '06 Mar 2026',
    },
    {
      codigo: 'MAT-003',
      estudiante: 'Valeria Quispe',
      nivel: 'Primaria',
      grado: '5°',
      estado: 'Pendiente',
      fecha: '08 Mar 2026',
    },
    {
      codigo: 'MAT-004',
      estudiante: 'Diego Fernández',
      nivel: 'Inicial',
      grado: '5 años',
      estado: 'Activa',
      fecha: '10 Mar 2026',
    },
    {
      codigo: 'MAT-005',
      estudiante: 'Camila Salazar',
      nivel: 'Secundaria',
      grado: '2°',
      estado: 'Activa',
      fecha: '11 Mar 2026',
    },
  ];
}
