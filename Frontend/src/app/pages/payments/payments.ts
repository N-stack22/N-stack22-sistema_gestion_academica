import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { CatalogService } from '../../services/catalog.service';
import { ParentContextService } from '../../services/parent-context.service';
import { PaymentService } from '../../services/payment.service';
import { Pension, PensionService } from '../../services/pension.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentService } from '../../services/student.service';

interface PendingPension {
  id: string;
  label: string;
  concept: string;
  period: string;
  dueDate: string;
  status: string;
  statusCode: string;
  amount: number;
}

@Component({
  selector: 'app-payments',
  imports: [StatCard, DataTable],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments implements OnInit {
  public readonly roleContext = inject(RoleContextService);
  public readonly parentContext = inject(ParentContextService);
  private readonly paymentService = inject(PaymentService);
  private readonly pensionService = inject(PensionService);
  private readonly studentService = inject(StudentService);
  private readonly catalogService = inject(CatalogService);

  public readonly allRows = signal<DataTableRow[]>([]);
  public readonly estudiantes = signal<{ id: string; fullName: string }[]>([]);
  public readonly pensiones = signal<PendingPension[]>([]);
  public readonly metodos = signal<{ codigo: string; nombre: string }[]>([]);

  public readonly estudianteId = signal('');
  public readonly pensionId = signal('');
  public readonly monto = signal(0);
  public readonly metodoPago = signal('EFECTIVO');
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');
  public readonly loading = signal(false);

  public readonly isParentView = computed(() => this.roleContext.isParent());

  public readonly pensionSeleccionada = computed(
    () => this.pensiones().find((p) => p.id === this.pensionId()) ?? null,
  );

  public readonly validosRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] === 'PAGADO'),
  );

  public readonly anuladosRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] === 'ANULADO'),
  );

  public readonly pendingDebtRows = computed<DataTableRow[]>(() =>
    this.pensiones().map((pension) => ({
      _id: pension.id,
      _amount: String(pension.amount),
      concepto: pension.concept,
      periodo: pension.period,
      vencimiento: pension.dueDate || '-',
      monto: `S/ ${pension.amount.toFixed(2)}`,
      estado: pension.status,
    })),
  );

  public readonly metrics = signal([
    {
      id: 1,
      title: 'Pagos validos',
      value: 0,
      description: 'Excluye anulados',
      icon: 'bi-credit-card-fill',
      variant: 'primary' as const,
    },
  ]);

  public readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Cod. operacion' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'responsable', label: 'Apoderado' },
    { key: 'monto', label: 'Monto' },
    { key: 'metodo', label: 'Metodo' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  public readonly debtColumns: DataTableColumn[] = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'periodo', label: 'Periodo' },
    { key: 'vencimiento', label: 'Vencimiento' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
  ];

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.estudianteId.set(id);
      this.loadPagos();
    });
  }

  ngOnInit(): void {
    this.catalogService.metodosPago().subscribe({
      next: (m) => this.metodos.set(m as { codigo: string; nombre: string }[]),
    });

    if (this.roleContext.isParent()) return;

    this.loadPagos();
    if (this.roleContext.isInstitutional()) {
      this.studentService.listar().subscribe({
        next: (s) => this.estudiantes.set(s.map((e) => ({ id: e.id, fullName: e.fullName }))),
      });
    }
  }

  public loadPagos(): void {
    const studentId = this.roleContext.isParent()
      ? this.parentContext.selectedStudentId() ?? undefined
      : this.estudianteId() || undefined;

    if (this.roleContext.isParent() && !studentId) {
      this.allRows.set([]);
      return;
    }

    this.loading.set(true);
    this.paymentService.listar(studentId, false).subscribe({
      next: (items) => {
        const mapped: DataTableRow[] = (items as Record<string, unknown>[]).map((p) => ({
          _id: String(p['id'] ?? ''),
          _canVoid: p['canVoid'] ? '1' : '0',
          _statusCode: String(p['statusCode'] ?? ''),
          codigo: String(p['operationCode'] ?? '-'),
          estudiante: String(p['studentName'] ?? '-'),
          responsable: String(p['parentName'] ?? '-'),
          monto: `S/ ${p['amount'] ?? ''}`,
          metodo: String(p['method'] ?? '-'),
          estado: String(p['status'] ?? '-'),
          fecha: String(p['date'] ?? '-'),
        }));
        this.allRows.set(mapped);

        const validos = (items as Record<string, string>[]).filter(
          (p) => p['statusCode'] === 'PAGADO',
        ).length;
        this.metrics.set([
          {
            id: 1,
            title: 'Pagos validos',
            value: validos,
            description: 'Excluye anulados',
            icon: 'bi-credit-card-fill',
            variant: 'primary',
          },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  public onEstudianteChange(id: string): void {
    this.estudianteId.set(id);
    this.pensionId.set('');
    this.monto.set(0);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.cargarPensionesPendientes(id);
    this.loadPagos();
  }

  public cargarPensionesPendientes(estudianteId: string): void {
    if (!estudianteId) {
      this.pensiones.set([]);
      return;
    }

    forkJoin([
      this.pensionService.listar({ estudiante_id: estudianteId, estado: 'PENDIENTE' }),
      this.pensionService.listar({ estudiante_id: estudianteId, estado: 'VENCIDA' }),
    ]).subscribe({
      next: ([pending, overdue]) => {
        const byId = new Map<string, Pension>();
        for (const pension of [...pending, ...overdue]) {
          byId.set(pension.id, pension);
        }
        this.pensiones.set(Array.from(byId.values()).map((p) => this.mapPendingPension(p)));
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las deudas pendientes del estudiante.');
        this.pensiones.set([]);
      },
    });
  }

  public onPensionChange(id: string): void {
    this.pensionId.set(id);
    const pen = this.pensiones().find((p) => p.id === id);
    this.monto.set(pen?.amount ?? 0);
  }

  public registrarPago(pensionId = this.pensionId()): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const pension = this.pensiones().find((p) => p.id === pensionId);
    const amount = pension?.amount ?? this.monto();

    if (!pensionId || !amount) {
      this.errorMessage.set('Seleccione una deuda pendiente para marcarla como pagada.');
      return;
    }

    this.paymentService
      .registrar({
        pension_id: pensionId,
        estudiante_id: this.estudianteId() || undefined,
        metodo_pago_codigo: this.metodoPago(),
        monto: amount,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Pago registrado y pension marcada como pagada.');
          const studentId = this.estudianteId();
          this.pensionId.set('');
          this.monto.set(0);
          if (studentId) this.cargarPensionesPendientes(studentId);
          this.loadPagos();
        },
        error: (err: { error?: { detail?: string } }) =>
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo registrar el pago.'),
      });
  }

  public marcarPensionPagada(row: DataTableRow): void {
    const pensionId = String(row['_id'] ?? '');
    if (!pensionId) return;
    this.onPensionChange(pensionId);
    this.registrarPago(pensionId);
  }

  public anularPago(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || row['_canVoid'] !== '1') return;

    this.paymentService.anular(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Pago anulado.');
        const studentId = this.estudianteId();
        if (studentId) this.cargarPensionesPendientes(studentId);
        this.loadPagos();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo anular.'),
    });
  }

  private mapPendingPension(pension: Pension): PendingPension {
    const amount = parseFloat(String(pension.amount).replace(/[^\d.]/g, '')) || 0;
    const period = `${pension.month}/${pension.year}`;
    return {
      id: pension.id,
      label: `${pension.concept} ${period}`,
      concept: pension.concept,
      period,
      dueDate: pension.dueDate,
      status: pension.status,
      statusCode: pension.statusCode ?? '',
      amount,
    };
  }
}
