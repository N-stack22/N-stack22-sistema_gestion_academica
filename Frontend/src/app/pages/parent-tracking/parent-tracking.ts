import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AuthService } from '../../services/auth.service';
import { CatalogService } from '../../services/catalog.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';

@Component({
  selector: 'app-parent-tracking',
  imports: [DataTable],
  templateUrl: './parent-tracking.html',
  styleUrl: './parent-tracking.scss',
})
export class ParentTracking implements OnInit {
  private readonly seguimientoService = inject(SeguimientoService);
  private readonly catalogService = inject(CatalogService);
  private readonly auth = inject(AuthService);
  protected readonly roleContext = inject(RoleContextService);
  protected readonly parentContext = inject(ParentContextService);

  protected readonly busqueda = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly estadoFiltro = signal('');
  protected readonly comunicacionFiltro = signal('');
  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly rawItems = signal<Record<string, string>[]>([]);
  protected readonly selectedCase = signal<Record<string, string> | null>(null);

  protected readonly observacion = signal('');
  protected readonly estadoCodigo = signal('REGULAR');
  protected readonly ultimaComunicacion = signal('');
  protected readonly successMessage = signal('');

  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<{ id: string; nombre: string }[]>([]);
  protected readonly secciones = signal<{ id: string; nombre: string }[]>([]);
  protected readonly estados = signal<{ codigo: string; nombre: string }[]>([]);
  protected readonly anioId = signal('');

  protected readonly isParentView = computed(() => this.roleContext.isParent());

  protected readonly columns = computed<DataTableColumn[]>(() =>
    this.isParentView()
      ? [
          { key: 'fecha', label: 'Fecha' },
          { key: 'registradoPor', label: 'Registrado por' },
          { key: 'estadoAcademico', label: 'Estado' },
          { key: 'observacion', label: 'Observación' },
        ]
      : [
          { key: 'estudiante', label: 'Estudiante' },
          { key: 'apoderado', label: 'Apoderado' },
          { key: 'nivel', label: 'Nivel' },
          { key: 'grado', label: 'Grado' },
          { key: 'seccion', label: 'Sección' },
          { key: 'estadoAcademico', label: 'Estado académico' },
          { key: 'comunicacion', label: 'Comunicación' },
        ],
  );

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.load();
    });
  }

  ngOnInit(): void {
    if (this.roleContext.isParent()) {
      this.catalogService.estadosSeguimiento().subscribe({
        next: (e) => this.estados.set(e as { codigo: string; nombre: string }[]),
      });
      return;
    }
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.estadosSeguimiento().subscribe({
      next: (e) => this.estados.set(e as { codigo: string; nombre: string }[]),
    });
    this.catalogService.anios().subscribe({
      next: (a) => {
        const list = a as { id: string; anio: number }[];
        if (list.length) this.anioId.set(list[0].id);
      },
    });
    this.load();
  }

  protected onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as { id: string; nombre: string }[]),
      });
    }
    this.load();
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    if (this.anioId()) {
      this.catalogService.secciones(this.anioId(), gradoId || undefined).subscribe({
        next: (s) => this.secciones.set(s as { id: string; nombre: string }[]),
      });
    }
    this.load();
  }

  protected load(): void {
    const params: Record<string, string> = {};
    if (this.roleContext.isParent()) {
      const studentId = this.parentContext.selectedStudentId();
      if (!studentId) {
        this.rows.set([]);
        return;
      }
      params['estudiante_id'] = studentId;
    } else {
      if (this.busqueda()) params['busqueda'] = this.busqueda();
      if (this.nivelId()) params['nivel_id'] = this.nivelId();
      if (this.gradoId()) params['grado_id'] = this.gradoId();
      if (this.seccionId()) params['seccion_id'] = this.seccionId();
      if (this.estadoFiltro()) params['estado'] = this.estadoFiltro();
      if (this.comunicacionFiltro()) params['comunicacion'] = this.comunicacionFiltro();
    }

    this.seguimientoService.listar(params).subscribe({
      next: (items) => {
        const list = items as Record<string, string>[];
        this.rawItems.set(list);
        this.rows.set(
          list.map((r) =>
            this.isParentView()
              ? {
                  _id: r['id'],
                  fecha: r['lastContact'] ?? '—',
                  registradoPor: r['registeredBy'] ?? r['parentName'] ?? '—',
                  estadoAcademico: r['academicStatus'] ?? '—',
                  observacion: r['notes'] ?? '—',
                }
              : {
                  _id: r['id'],
                  estudiante: r['studentName'] ?? '—',
                  apoderado: r['parentName'] ?? '—',
                  nivel: r['level'] ?? '—',
                  grado: r['grade'] ?? '—',
                  seccion: r['section'] ?? '—',
                  estadoAcademico: r['academicStatus'] ?? '—',
                  comunicacion: r['communicationStatus'] ?? '—',
                },
          ),
        );
      },
    });
  }

  protected onDetail(row: DataTableRow): void {
    const item = this.rawItems().find((r) => r['id'] === row['_id']);
    if (item) {
      this.selectedCase.set(item);
      this.observacion.set(item['notes'] ?? '');
      this.ultimaComunicacion.set(item['lastContact'] ?? '');
    }
  }

  protected registrarComunicacion(): void {
    const caso = this.selectedCase();
    const user = this.auth.currentUser();
    if (!caso || !user) return;

    this.seguimientoService
      .crear({
        estudiante_id: caso['studentId'],
        apoderado_id: caso['parentId'] || undefined,
        estado_codigo: this.estadoCodigo(),
        observacion: this.observacion(),
        ultima_comunicacion: this.ultimaComunicacion() || new Date().toISOString().slice(0, 10),
        registrado_por_perfil_id: user.id,
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Comunicación y seguimiento registrados.');
          this.load();
        },
      });
  }
}
