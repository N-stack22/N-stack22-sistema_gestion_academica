import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { RoleContextService } from '../../services/role-context.service';

interface PaymentTimelineItem {
  codigo: string;
  concepto: string;
  monto: string;
  estado: string;
  fecha: string;
}

@Component({
  selector: 'app-payments',
  imports: [StatCard, DataTable],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments {
  protected readonly roleContext = inject(RoleContextService);

  private readonly adminMetrics = [
    {
      id: 1,
      title: 'Recaudado del mes',
      value: 'S/ 185,200',
      description: 'Marzo 2026 — simulado',
      icon: 'bi-cash-coin',
      variant: 'success' as const,
    },
    {
      id: 2,
      title: 'Pagos registrados',
      value: 768,
      description: 'Confirmados',
      icon: 'bi-credit-card-fill',
      variant: 'primary' as const,
    },
    {
      id: 3,
      title: 'Pendientes',
      value: 45,
      description: 'Por confirmar',
      icon: 'bi-hourglass-split',
      variant: 'warning' as const,
    },
    {
      id: 4,
      title: 'Observados',
      value: 8,
      description: 'Requieren revisión',
      icon: 'bi-exclamation-circle',
      variant: 'danger' as const,
    },
  ];

  protected readonly metrics = computed(() => {
    if (this.roleContext.isInstitutional()) {
      return this.adminMetrics;
    }
    return [];
  });

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'responsable', label: 'Responsable' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  protected readonly adminRows: DataTableRow[] = [
    { codigo: 'PAG-001', concepto: 'Pensión marzo', responsable: 'Rosa Quispe', monto: 'S/ 450', estado: 'Pagado', fecha: '05 Mar 2026' },
    { codigo: 'PAG-002', concepto: 'Matrícula 2026', responsable: 'Jorge Rojas', monto: 'S/ 350', estado: 'Pagado', fecha: '06 Mar 2026' },
    { codigo: 'PAG-003', concepto: 'Pensión marzo', responsable: 'Patricia Quispe', monto: 'S/ 420', estado: 'Pendiente', fecha: '—' },
    { codigo: 'PAG-004', concepto: 'Taller extracurricular', responsable: 'Ricardo Fernández', monto: 'S/ 80', estado: 'Observado', fecha: '08 Mar 2026' },
    { codigo: 'PAG-005', concepto: 'Pensión marzo', responsable: 'Claudia Salazar', monto: 'S/ 450', estado: 'Pendiente', fecha: '—' },
  ];

  protected readonly familyTimeline: PaymentTimelineItem[] = [
    { codigo: 'PAG-102', concepto: 'Matrícula 2026', monto: 'S/ 350', estado: 'Pagado', fecha: '02 Mar 2026' },
    { codigo: 'PAG-101', concepto: 'Pensión marzo', monto: 'S/ 450', estado: 'Pagado', fecha: '05 Mar 2026' },
    { codigo: 'PAG-103', concepto: 'Material educativo', monto: 'S/ 120', estado: 'Pagado', fecha: '10 Mar 2026' },
    { codigo: 'PAG-104', concepto: 'Pensión abril', monto: 'S/ 450', estado: 'Pendiente', fecha: '—' },
  ];

  protected readonly studentEnrollment = {
    matricula: 'Matrícula 2026 — Pagada',
    pensionPendiente: 'Pensión abril — Pendiente',
    ultimoPago: '05 Mar 2026',
  };

  protected statusBadgeClass(estado: string): string {
    const normalized = estado.toLowerCase();
    if (normalized.includes('pagado')) {
      return 'status-badge status-badge--success';
    }
    if (normalized.includes('pendiente')) {
      return 'status-badge status-badge--warning';
    }
    if (normalized.includes('observado')) {
      return 'status-badge status-badge--danger';
    }
    return 'status-badge status-badge--info';
  }

  protected studentLabel(): string {
    const student = this.roleContext.getActiveStudent();
    return student ? `${student.fullName} — ${student.grade} ${student.level} ${student.section}` : '';
  }
}
