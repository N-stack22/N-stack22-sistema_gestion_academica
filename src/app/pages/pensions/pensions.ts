import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-pensions',
  imports: [StatCard, DataTable],
  templateUrl: './pensions.html',
  styleUrl: './pensions.scss',
})
export class Pensions {
  protected readonly roleContext = inject(RoleContextService);

  private readonly adminMetrics = [
    {
      id: 1,
      title: 'Total emitido',
      value: 'S/ 382,500',
      description: 'Marzo 2026',
      icon: 'bi-receipt',
      variant: 'primary' as const,
    },
    {
      id: 2,
      title: 'Pendiente',
      value: 45,
      description: 'Por regularizar',
      icon: 'bi-exclamation-circle',
      variant: 'warning' as const,
    },
    {
      id: 3,
      title: 'Pagado',
      value: 805,
      description: '94.7% del mes',
      icon: 'bi-check-circle-fill',
      variant: 'success' as const,
    },
    {
      id: 4,
      title: 'Vencido',
      value: 8,
      description: 'Requieren seguimiento',
      icon: 'bi-clock-history',
      variant: 'danger' as const,
    },
  ];

  private readonly familyMetrics = [
    {
      id: 1,
      title: 'Pagadas',
      value: 2,
      description: 'Año escolar 2026',
      icon: 'bi-check-circle-fill',
      variant: 'success' as const,
    },
    {
      id: 2,
      title: 'Pendientes',
      value: 1,
      description: 'Abril 2026',
      icon: 'bi-exclamation-circle',
      variant: 'warning' as const,
    },
  ];

  protected readonly metrics = computed(() =>
    this.roleContext.isInstitutional() ? this.adminMetrics : this.familyMetrics,
  );

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'mes', label: 'Mes' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'vencimiento', label: 'Vencimiento' },
  ];

  protected readonly familyColumns: DataTableColumn[] = [
    { key: 'mes', label: 'Mes' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'vencimiento', label: 'Vencimiento' },
  ];

  protected readonly columns = computed(() =>
    this.roleContext.isInstitutional() ? this.adminColumns : this.familyColumns,
  );

  protected readonly adminRows: DataTableRow[] = [
    { estudiante: 'Lucía Torres', mes: 'Marzo 2026', monto: 'S/ 450', estado: 'Pagada', vencimiento: '10 Mar 2026' },
    { estudiante: 'Mateo Rojas', mes: 'Marzo 2026', monto: 'S/ 450', estado: 'Pagada', vencimiento: '10 Mar 2026' },
    { estudiante: 'Valeria Quispe', mes: 'Marzo 2026', monto: 'S/ 420', estado: 'Pendiente', vencimiento: '10 Abr 2026' },
    { estudiante: 'Diego Fernández', mes: 'Marzo 2026', monto: 'S/ 480', estado: 'Pagada', vencimiento: '10 Mar 2026' },
    { estudiante: 'Camila Salazar', mes: 'Marzo 2026', monto: 'S/ 450', estado: 'Pendiente', vencimiento: '10 Abr 2026' },
  ];

  protected readonly rows = computed(() => {
    if (this.roleContext.isInstitutional()) {
      return this.adminRows;
    }
    return this.roleContext.getStudentPensions();
  });
}
