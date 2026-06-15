import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  imports: [DataTable],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly catalogService = inject(CatalogService);

  protected readonly selectedTipo = signal('estudiantes');
  protected readonly draftAnioId = signal('');
  protected readonly draftNivelId = signal('');
  protected readonly draftGradoId = signal('');
  protected readonly draftSeccionId = signal('');
  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly columns = signal<DataTableColumn[]>([]);
  protected readonly total = signal(0);
  protected readonly rawRows = signal<Record<string, unknown>[]>([]);
  protected readonly reporteGenerado = signal('');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly anios = signal<{ id: string; anio: number }[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<CatalogGrade[]>([]);
  protected readonly secciones = signal<CatalogSection[]>([]);

  protected readonly requiereSalon = computed(() => this.selectedTipo() === 'estudiantes');

  protected readonly tipos = [
    { id: 'estudiantes', label: 'Estudiantes por salón' },
    { id: 'docentes', label: 'Docentes y cursos' },
    { id: 'comunicados', label: 'Comunicados' },
    { id: 'eventos', label: 'Eventos' },
  ];

  protected readonly reporteTitulo = computed(
    () => this.tipos.find((t) => t.id === this.reporteGenerado())?.label ?? '',
  );

  ngOnInit(): void {
    this.catalogService.anios().subscribe({
      next: (anios) => this.anios.set(anios as { id: string; anio: number }[]),
    });
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
  }

  protected onTipoChange(value: string): void {
    this.selectedTipo.set(value);
    this.limpiarResultados();
  }

  protected onNivelChange(nivelId: string): void {
    this.draftNivelId.set(nivelId);
    this.draftGradoId.set('');
    this.draftSeccionId.set('');
    this.secciones.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as CatalogGrade[]),
      });
    } else {
      this.grados.set([]);
    }
  }

  protected onGradoChange(gradoId: string): void {
    this.draftGradoId.set(gradoId);
    this.draftSeccionId.set('');
    if (this.draftAnioId() && gradoId) {
      this.catalogService.secciones(this.draftAnioId(), gradoId).subscribe({
        next: (s) => this.secciones.set(s as CatalogSection[]),
      });
    } else {
      this.secciones.set([]);
    }
  }

  protected onAnioChange(anioId: string): void {
    this.draftAnioId.set(anioId);
    this.onGradoChange(this.draftGradoId());
  }

  protected generar(): void {
    const tipo = this.selectedTipo();
    this.limpiarResultados();
    this.loading.set(true);
    this.errorMessage.set('');

    if (tipo === 'estudiantes' && (!this.draftAnioId() || !this.draftGradoId() || !this.draftSeccionId())) {
      this.loading.set(false);
      this.errorMessage.set('Para el reporte de estudiantes seleccione año, grado y sección.');
      return;
    }

    const params: Record<string, string> = {};
    if (tipo === 'estudiantes') {
      params['anio_id'] = this.draftAnioId();
      params['grado_id'] = this.draftGradoId();
      params['seccion_id'] = this.draftSeccionId();
    }

    this.reportService.generar(tipo, params).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data.tipo !== tipo) {
          this.errorMessage.set('La respuesta del servidor no coincide con el reporte solicitado.');
          return;
        }
        this.reporteGenerado.set(tipo);
        this.total.set(data.total);
        this.rawRows.set(data.rows);
        if (!data.rows.length) return;

        const keys = Object.keys(data.rows[0]).filter((k) => k !== 'id');
        this.columns.set(keys.map((k) => ({ key: k, label: this.labelFor(k) })));
        this.rows.set(
          data.rows.map((r, i) => ({
            _id: String(r['id'] ?? r['codigo'] ?? `report-${i}`),
            ...Object.fromEntries(
              Object.entries(r).filter(([k]) => k !== 'id').map(([k, v]) => [k, String(v ?? '')]),
            ),
          })),
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.limpiarResultados();
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo generar el reporte.');
      },
    });
  }

  protected exportarCsv(): void {
    const data = this.rawRows();
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter((k) => k !== 'id');
    const header = keys.map((k) => this.labelFor(k)).join(',');
    const lines = data.map((row) =>
      keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(','),
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${this.reporteGenerado() || this.selectedTipo()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected imprimir(): void {
    window.print();
  }

  private limpiarResultados(): void {
    this.rows.set([]);
    this.columns.set([]);
    this.rawRows.set([]);
    this.total.set(0);
    this.reporteGenerado.set('');
  }

  private labelFor(key: string): string {
    const labels: Record<string, string> = {
      codigo: 'Código',
      nombre: 'Nombre',
      nivel: 'Nivel',
      grado: 'Grado',
      seccion: 'Sección',
      anio: 'Año',
      estado: 'Estado',
      titulo: 'Título',
      destinatario: 'Destinatario',
      resumen: 'Resumen',
      fecha: 'Fecha',
      especialidad: 'Especialidad',
      cursos: 'Cursos',
      inicio: 'Inicio',
      fin: 'Fin',
      lugar: 'Lugar',
    };
    return labels[key] ?? key;
  }
}
