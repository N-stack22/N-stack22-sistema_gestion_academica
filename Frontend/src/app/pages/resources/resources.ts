import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { CatalogService } from '../../services/catalog.service';
import { CourseService } from '../../services/course.service';
import { ResourceService } from '../../services/resource.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { isRequired } from '../../utils/form-validation';

@Component({
  selector: 'app-resources',
  imports: [DataTable],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources implements OnInit {
  private readonly resourceService = inject(ResourceService);
  private readonly catalogService = inject(CatalogService);
  private readonly courseService = inject(CourseService);
  public readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);

  public readonly editId = signal('');
  public readonly title = signal('');
  public readonly description = signal('');
  public readonly courseId = signal('');
  public readonly typeCode = signal('PDF');
  public readonly resourceUrl = signal('');
  public readonly selectedFile = signal<File | null>(null);
  public readonly submitted = signal(false);
  public readonly saving = signal(false);
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');

  public readonly draftBusqueda = signal('');
  public readonly draftCurso = signal('');
  public readonly draftTipo = signal('');

  public readonly filtroBusqueda = signal('');
  public readonly filtroCurso = signal('');
  public readonly filtroTipo = signal('');

  public readonly cursos = signal<{ id: string; name: string }[]>([]);
  public readonly tipos = signal<{ codigo: string; nombre: string }[]>([]);
  public readonly allRows = signal<DataTableRow[]>([]);

  public readonly editMode = computed(() => !!this.editId());

  public readonly titleError = computed(() =>
    this.submitted() || this.title() ? isRequired(this.title(), 'El título es obligatorio.') : '',
  );
  public readonly courseError = computed(() =>
    this.submitted() || this.courseId() ? isRequired(this.courseId(), 'El curso es obligatorio.') : '',
  );
  public readonly resourceLinkError = computed(() => {
    if (!this.submitted() && !this.resourceUrl() && !this.selectedFile()) return '';
    if (this.editMode() && !this.resourceUrl() && !this.selectedFile()) return '';
    const url = this.resourceUrl().trim();
    const file = this.selectedFile();
    if (!url && !file) return 'Ingrese una URL o seleccione un archivo.';
    return '';
  });
  public readonly isFormValid = computed(
    () => !this.titleError() && !this.courseError() && !this.resourceLinkError(),
  );

  public readonly canManage = computed(
    () => this.roleContext.isInstitutional() || this.roleContext.isTeacher(),
  );

  public readonly adminColumns: DataTableColumn[] = [
    { key: 'recurso', label: 'Recurso' },
    { key: 'curso', label: 'Curso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'enlace', label: 'Enlace' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly personalColumns: DataTableColumn[] = [
    { key: 'recurso', label: 'Recurso' },
    { key: 'curso', label: 'Curso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'enlace', label: 'Enlace' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly canViewResource = computed(
    () => this.roleContext.isStudent() || this.roleContext.isParent(),
  );

  public readonly columns = computed(() =>
    this.roleContext.isStudent() || this.roleContext.isParent()
      ? this.personalColumns
      : this.adminColumns,
  );

  public readonly filteredRows = computed(() => {
    let rows = this.allRows();
    const q = this.filtroBusqueda().trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        [row['recurso'], row['curso'], row['tipo'], row['fecha']]
          .map((v) => String(v ?? '').toLowerCase())
          .some((v) => v.includes(q)),
      );
    }
    if (this.filtroTipo()) {
      rows = rows.filter((row) => row['_typeCode'] === this.filtroTipo());
    }
    return rows;
  });

  public readonly disponiblesRows = computed(() =>
    this.filteredRows().filter((row) => row['_active'] === '1'),
  );

  public readonly archivadosRows = computed(() =>
    this.filteredRows().filter((row) => row['_active'] === '0'),
  );

  ngOnInit(): void {
    this.catalogService.tiposRecurso().subscribe({
      next: (t) => this.tipos.set(t as { codigo: string; nombre: string }[]),
    });
    this.roleContext.whenReady(() => this.loadCursos());
  }

  public loadCursos(): void {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      this.studentContext.ensureLoaded();
      this.cursos.set(
        this.studentContext.courses().map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
      );
      this.loadRecursos();
      return;
    }
    const params: Record<string, string> = {};
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }
    this.courseService.listar(params).subscribe({
      next: (c) => {
        this.cursos.set(
          c.map((x) => ({ id: x.id, name: x.label ?? x.name })).sort((a, b) => a.name.localeCompare(b.name)),
        );
        this.loadRecursos();
      },
      error: () => this.loadRecursos(),
    });
  }

  public buscar(): void {
    this.filtroBusqueda.set(this.draftBusqueda().trim());
    this.filtroCurso.set(this.draftCurso());
    this.filtroTipo.set(this.draftTipo());
    this.loadRecursos();
  }

  public loadRecursos(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.allRows.set([]);
      return;
    }

    const cursoId = this.filtroCurso() || undefined;
    const docenteId =
      this.roleContext.isTeacher() && this.roleContext.getTeacherId()
        ? this.roleContext.getTeacherId()!
        : undefined;
    const estudianteId =
      (this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()
        ? this.roleContext.getStudentId()!
        : undefined;
    this.resourceService.listar(cursoId, docenteId, estudianteId).subscribe({
      next: (items) => {
        let filtered = items;
        if (this.roleContext.isStudent() || this.roleContext.isParent()) {
          filtered = filtered.filter((r) => r.active !== false);
        }
        this.allRows.set(
          filtered.map((r) => ({
            _id: r.id,
            _active: r.active !== false ? '1' : '0',
            _canArchive: r.active !== false ? '1' : '0',
            _canRestore: r.active === false ? '1' : '0',
            _typeCode: r.typeCode ?? '',
            _courseId: r.courseId ?? '',
            _description: r.description ?? '',
            _fileUrl: r.fileUrl ?? '',
            _fileStorageRef: r.fileStorageRef ?? '',
            _fileName: r.fileName ?? '',
            recurso: r.title,
            curso: r.courseLabel ?? r.course,
            tipo: r.type,
            enlace: r.fileUrl ? (r.fileName || 'Ver enlace') : '—',
            fecha: r.date,
            estado: r.status,
          })),
        );
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudieron cargar los recursos.'),
    });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!this.isFormValid() || this.saving()) return;

    const url = this.resourceUrl().trim();
    const file = this.selectedFile();

    const payload: Record<string, unknown> = {
      titulo: this.title().trim(),
      descripcion: this.description().trim() || undefined,
      curso_asignado_id: this.courseId(),
      tipo_recurso_codigo: this.typeCode(),
      docente_id: this.roleContext.getTeacherId() ?? undefined,
    };

    if (file) {
      this.saving.set(true);
      this.resourceService.upload(file).subscribe({
        next: (uploaded) => {
          payload['archivo_url'] = uploaded.archivo_url;
          payload['nombre_archivo'] = uploaded.nombre_archivo;
          this.saveResource(payload);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo subir el archivo al bucket de recursos.');
        },
      });
      return;
    }

    if (url) {
      payload['archivo_url'] = url;
      payload['nombre_archivo'] = url || this.title().trim();
    }

    this.saving.set(true);
    this.saveResource(payload);
  }

  private saveResource(payload: Record<string, unknown>): void {
    const request = this.editMode()
      ? this.resourceService.actualizar(this.editId(), payload)
      : this.resourceService.crear(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(
          this.editMode()
            ? `Recurso "${this.title()}" actualizado correctamente.`
            : `Recurso "${this.title()}" registrado correctamente.`,
        );
        this.cancelEdit();
        this.loadRecursos();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err?.error?.detail ??
            (this.editMode() ? 'No se pudo actualizar el recurso.' : 'No se pudo registrar el recurso.'),
        );
      },
    });
  }

  public editarRecurso(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.editId.set(String(id));
    this.title.set(String(row['recurso'] ?? ''));
    this.description.set(String(row['_description'] ?? ''));
    this.courseId.set(String(row['_courseId'] ?? ''));
    this.typeCode.set(String(row['_typeCode'] ?? 'PDF'));
    const fileUrl = String(row['_fileUrl'] ?? '');
    const storageRef = String(row['_fileStorageRef'] ?? '');
    this.resourceUrl.set((storageRef || fileUrl.startsWith('simulado://')) ? '' : fileUrl);
    this.selectedFile.set(null);
    this.submitted.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  public cancelEdit(): void {
    this.editId.set('');
    this.title.set('');
    this.description.set('');
    this.courseId.set('');
    this.typeCode.set('PDF');
    this.resourceUrl.set('');
    this.selectedFile.set(null);
    this.submitted.set(false);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  public verRecurso(row: DataTableRow): void {
    const url = String(row['_fileUrl'] ?? '').trim();
    const name = String(row['_fileName'] ?? row['recurso'] ?? 'recurso');
    if (!url) {
      this.errorMessage.set('Este recurso no tiene un enlace disponible.');
      return;
    }
    if (url.startsWith('simulado://')) {
      const fileName = url.replace('simulado://', '') || name;
      this.errorMessage.set(`"${fileName}" fue registrado antes de habilitar la subida real. Edite el recurso y vuelva a subir el PDF.`);
      return;
    }
    window.open(url, '_blank', 'noopener');
  }

  public archivarRecurso(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || row['_canArchive'] !== '1') {
      this.errorMessage.set('Este recurso no puede archivarse.');
      return;
    }
    if (
      !window.confirm(
        '¿Archivar este recurso? Dejará de estar disponible para estudiantes, pero permanecerá en el historial.',
      )
    ) {
      return;
    }

    this.errorMessage.set('');
    this.resourceService.archivar(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Recurso archivado correctamente.');
        if (this.editId() === id) this.cancelEdit();
        this.loadRecursos();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo archivar el recurso.'),
    });
  }

  public desarchivarRecurso(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || row['_canRestore'] !== '1') {
      this.errorMessage.set('Este recurso no puede desarchivarse.');
      return;
    }
    if (!window.confirm('¿Desarchivar este recurso? Volverá a estar disponible para la comunidad educativa.')) {
      return;
    }

    this.errorMessage.set('');
    this.resourceService.desarchivar(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Recurso desarchivado correctamente.');
        if (this.editId() === id) this.cancelEdit();
        this.loadRecursos();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo desarchivar el recurso.'),
    });
  }
}
