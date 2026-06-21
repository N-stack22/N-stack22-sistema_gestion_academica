import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { CatalogService } from '../../services/catalog.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { PaymentService } from '../../services/payment.service';
import { Pension, PensionService } from '../../services/pension.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-payments',
  imports: [StatCard, DataTable],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments implements OnInit {
  protected readonly roleContext = inject(RoleContextService);
  protected readonly parentContext = inject(ParentContextService);
  private readonly paymentService = inject(PaymentService);
  private readonly pensionService = inject(PensionService);
  private readonly studentService = inject(StudentService);
  private readonly catalogService = inject(CatalogService);

  protected readonly allRows = signal<DataTableRow[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string }[]>([]);
  protected readonly pensiones = signal<{ id: string; label: string; amount: number }[]>([]);
  protected readonly metodos = signal<{ codigo: string; nombre: string }[]>([]);

  protected readonly estudianteId = signal('');
  protected readonly pensionId = signal('');
  protected readonly monto = signal(0);
  protected readonly metodoPago = signal('EFECTIVO');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly loading = signal(false);

  protected readonly draftFiltroBusqueda = signal('');
  protected readonly draftFiltroEstado = signal('');
  protected readonly draftFiltroDesde = signal('');
  protected readonly draftFiltroHasta = signal('');
  protected readonly draftFiltroMetodo = signal('');
  protected readonly filtroBusqueda = signal('');
  protected readonly filtroEstado = signal('');
  protected readonly filtroDesde = signal('');
  protected readonly filtroHasta = signal('');
  protected readonly filtroMetodo = signal('');

  protected readonly isParentView = computed(() => this.roleContext.isParent());

  protected readonly pensionSeleccionada = computed(
    () => this.pensiones().find((p) => p.id === this.pensionId()) ?? null,
  );

  protected readonly validosRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] === 'PAGADO'),
  );

  protected readonly anuladosRows = computed(() =>
    this.allRows().filter((r) => r['_statusCode'] === 'ANULADO'),
  );

  protected readonly metrics = signal([
    {
      id: 1,
      title: 'Pagos válidos',
      value: 0,
      description: 'Excluye anulados',
      icon: 'bi-credit-card-fill',
      variant: 'primary' as const,
    },
  ]);

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Cód. operación' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'responsable', label: 'Apoderado' },
    { key: 'monto', label: 'Monto' },
    { key: 'metodo', label: 'Método' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
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

  protected loadPagos(): void {
    const studentId = this.roleContext.isParent()
      ? this.parentContext.selectedStudentId() ?? undefined
      : this.estudianteId() || undefined;
    if (this.roleContext.isParent() && !studentId) {
      this.allRows.set([]);
      return;
    }
    this.loading.set(true);
    this.paymentService
      .listar(studentId, false, {
        busqueda: this.filtroBusqueda() || undefined,
        estado: this.filtroEstado() || undefined,
        fechaDesde: this.filtroDesde() || undefined,
        fechaHasta: this.filtroHasta() || undefined,
        metodo: this.filtroMetodo() || undefined,
      })
      .subscribe({
      next: (items) => {
        const mapped: DataTableRow[] = (items as Record<string, unknown>[]).map((p) => ({
          _id: String(p['id'] ?? ''),
          _canVoid: p['canVoid'] ? '1' : '0',
          _statusCode: String(p['statusCode'] ?? ''),
          codigo: String(p['operationCode'] ?? '—'),
          estudiante: String(p['studentName'] ?? '—'),
          responsable: String(p['parentName'] ?? '—'),
          monto: `S/ ${p['amount'] ?? ''}`,
          metodo: String(p['method'] ?? '—'),
          estado: String(p['status'] ?? '—'),
          fecha: String(p['date'] ?? '—'),
        }));
        this.allRows.set(mapped);
        const validos = (items as Record<string, string>[]).filter(
          (p) => p['statusCode'] === 'PAGADO',
        ).length;
        this.metrics.set([
          {
            id: 1,
            title: 'Pagos válidos',
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

  protected buscarPagos(): void {
    this.filtroBusqueda.set(this.draftFiltroBusqueda().trim());
    this.filtroEstado.set(this.draftFiltroEstado());
    this.filtroDesde.set(this.draftFiltroDesde());
    this.filtroHasta.set(this.draftFiltroHasta());
    this.filtroMetodo.set(this.draftFiltroMetodo().trim());
    this.loadPagos();
  }

  protected onEstudianteChange(id: string): void {
    this.estudianteId.set(id);
    this.pensionId.set('');
    this.monto.set(0);
    this.cargarPensionesPendientes(id);
    this.loadPagos();
  }

  protected cargarPensionesPendientes(estudianteId: string): void {
    if (!estudianteId) {
      this.pensiones.set([]);
      return;
    }
    this.pensionService.listar({ estudiante_id: estudianteId, estado: 'PENDIENTE' }).subscribe({
      next: (items) =>
        this.pensiones.set(
          items.map((p: Pension) => ({
            id: p.id,
            label: `${p.studentName} — ${p.concept} ${p.month}/${p.year}`,
            amount: parseFloat(String(p.amount).replace(/[^\d.]/g, '')) || 0,
          })),
        ),
    });
  }

  protected onPensionChange(id: string): void {
    this.pensionId.set(id);
    const pen = this.pensiones().find((p) => p.id === id);
    if (pen) this.monto.set(pen.amount);
  }

  protected registrarPago(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!this.pensionId() || !this.monto()) {
      this.errorMessage.set('Seleccione una pensión y monto.');
      return;
    }
    this.paymentService
      .registrar({
        pension_id: this.pensionId(),
        estudiante_id: this.estudianteId() || undefined,
        metodo_pago_codigo: this.metodoPago(),
        monto: this.monto(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Pago registrado. Pendiente de validación administrativa.');
          this.loadPagos();
        },
        error: (err: { error?: { detail?: string } }) =>
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo registrar el pago.'),
      });
  }

  protected anularPago(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || row['_canVoid'] !== '1') return;
    this.paymentService.anular(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Pago anulado.');
        this.loadPagos();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo anular.'),
    });
  }
}
