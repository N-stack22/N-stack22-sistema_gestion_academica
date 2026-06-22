import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { StatCard } from '../../components/stat-card/stat-card';
import { CatalogService } from '../../services/catalog.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { Pension, PensionService } from '../../services/pension.service';

@Component({
  selector: 'app-pensions',
  imports: [StatCard, DataTable],
  templateUrl: './pensions.html',
  styleUrl: './pensions.scss',
})
export class Pensions implements OnInit {
  protected readonly roleContext = inject(RoleContextService);
  protected readonly parentContext = inject(ParentContextService);
  private readonly pensionService = inject(PensionService);
  private readonly catalogService = inject(CatalogService);

  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly anio = signal(2026);
  protected readonly mes = signal(3);
  protected readonly monto = signal(450);
  protected readonly draftNivelId = signal('');
  protected readonly draftGradoId = signal('');
  protected readonly draftSeccionId = signal('');
  protected readonly draftEstadoFiltro = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly estadoFiltro = signal('');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly selected = signal<Pension | null>(null);

  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<{ id: string; nombre: string }[]>([]);
  protected readonly secciones = signal<{ id: string; nombre: string }[]>([]);
  protected readonly anios = signal<{ id: string; anio: number }[]>([]);

  protected readonly isParentView = computed(() => this.roleContext.isParent());

  protected readonly metrics = computed(() => {
    const total = this.rows().length;
    const pendientes = this.rows().filter((r) => (r['estado'] ?? '').toLowerCase().includes('pend')).length;
    return [
      { id: 1, title: 'Registros', value: total, description: 'Pensiones cargadas', icon: 'bi-receipt', variant: 'primary' as const },
      { id: 2, title: 'Pendientes', value: pendientes, description: 'Por pagar', icon: 'bi-exclamation-circle', variant: 'warning' as const },
    ];
  });

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'mes', label: 'Mes' },
    { key: 'monto', label: 'Monto' },
    { key: 'estado', label: 'Estado' },
    { key: 'vencimiento', label: 'Vencimiento' },
  ];

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.loadPensiones();
    });
  }

  ngOnInit(): void {
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.anios().subscribe({
      next: (a) => {
        const list = a as { id: string; anio: number }[];
        this.anios.set(list);
        if (list.length) this.anio.set(list[0].anio);
      },
    });
    this.roleContext.whenReady(() => this.loadPensiones());
  }

  protected onDraftNivelChange(nivelId: string): void {
    this.draftNivelId.set(nivelId);
    this.draftGradoId.set('');
    this.draftSeccionId.set('');
    this.secciones.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as { id: string; nombre: string }[]),
      });
    } else {
      this.grados.set([]);
    }
  }

  protected onDraftGradoChange(gradoId: string): void {
    this.draftGradoId.set(gradoId);
    this.draftSeccionId.set('');
    const anioActivo = this.anios()[0]?.id;
    if (anioActivo && gradoId) {
      this.catalogService.secciones(anioActivo, gradoId).subscribe({
        next: (s) => this.secciones.set(s as { id: string; nombre: string }[]),
      });
    } else {
      this.secciones.set([]);
    }
  }

  protected buscar(): void {
    this.nivelId.set(this.draftNivelId());
    this.gradoId.set(this.draftGradoId());
    this.seccionId.set(this.draftSeccionId());
    this.estadoFiltro.set(this.draftEstadoFiltro());
    this.loadPensiones();
  }

  protected onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    this.secciones.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as { id: string; nombre: string }[]),
      });
    } else {
      this.grados.set([]);
    }
    this.loadPensiones();
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    const anioActivo = this.anios()[0]?.id;
    if (anioActivo) {
      this.catalogService.secciones(anioActivo, gradoId || undefined).subscribe({
        next: (s) => this.secciones.set(s as { id: string; nombre: string }[]),
      });
    }
    this.loadPensiones();
  }

  protected loadPensiones(): void {
    if (this.roleContext.isParent() && !this.roleContext.getStudentId()) {
      this.rows.set([]);
      return;
    }

    const params: Record<string, string | number> = {};
    if (this.seccionId()) params['seccion_id'] = this.seccionId();
    if (this.nivelId()) params['nivel_id'] = this.nivelId();
    if (this.gradoId()) params['grado_id'] = this.gradoId();
    if (this.estadoFiltro()) params['estado'] = this.estadoFiltro();
    if (this.roleContext.isParent() && this.roleContext.getStudentId()) {
      params['estudiante_id'] = this.roleContext.getStudentId()!;
    }
    this.pensionService.listar(params).subscribe({
      next: (items) => {
        this.rows.set(
          items.map((p, i) => ({
            _id: String(p.id || `pension-${i}`),
            codigo: p.studentCode ?? '—',
            estudiante: p.studentName || '—',
            nivel: p.level || '—',
            grado: p.grade || '—',
            seccion: p.section || '—',
            mes: `${p.month}/${p.year}`,
            monto: `S/ ${p.amount}`,
            estado: p.status || '—',
            vencimiento: p.dueDate || '—',
          })),
        );
      },
    });
  }

  protected generarPensiones(): void {
    this.pensionService
      .generar({ anio: this.anio(), mes: this.mes(), monto: this.monto(), seccion_id: this.seccionId() || undefined })
      .subscribe({
        next: () => {
          this.successMessage.set('Pensiones generadas para estudiantes matriculados.');
          this.loadPensiones();
        },
      });
  }

  protected onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.errorMessage.set('');
    this.pensionService.obtener(String(id)).subscribe({
      next: (p) => this.selected.set(p),
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo cargar el detalle de la pensión.');
      },
    });
  }

  protected cerrarDetalle(): void {
    this.selected.set(null);
  }
}
