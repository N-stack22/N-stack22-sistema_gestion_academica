import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { Student } from '../../interfaces/student';
import { AuthService } from '../../services/auth.service';
import { CatalogService } from '../../services/catalog.service';
import { ParentContextService } from '../../services/parent-context.service';
import { RoleContextService } from '../../services/role-context.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { StudentService } from '../../services/student.service';

type SeguimientoRow = Record<string, string>;

@Component({
  selector: 'app-parent-tracking',
  imports: [DataTable],
  templateUrl: './parent-tracking.html',
  styleUrl: './parent-tracking.scss',
})
export class ParentTracking implements OnInit {
  private readonly seguimientoService = inject(SeguimientoService);
  private readonly catalogService = inject(CatalogService);
  private readonly studentService = inject(StudentService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected readonly roleContext = inject(RoleContextService);
  protected readonly parentContext = inject(ParentContextService);

  protected readonly allRows = signal<DataTableRow[]>([]);
  protected readonly rawItems = signal<SeguimientoRow[]>([]);
  protected readonly students = signal<Student[]>([]);
  protected readonly selectedCase = signal<SeguimientoRow | null>(null);
  protected readonly selectedStudentId = signal('');

  protected readonly observacion = signal('');
  protected readonly estadoCodigo = signal('REGULAR');
  protected readonly ultimaComunicacion = signal(new Date().toISOString().slice(0, 10));
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly saving = signal(false);

  protected readonly estados = signal<{ codigo: string; nombre: string }[]>([]);

  protected readonly isParentView = computed(() => this.roleContext.isParent());
  protected readonly canRegisterFollowUp = computed(() => !this.isParentView());
  protected readonly rows = computed(() => this.allRows());
  protected readonly selectedStudent = computed(
    () => this.students().find((student) => student.id === this.selectedStudentId()) ?? null,
  );

  protected readonly pageLabel = computed(() => {
    if (this.roleContext.isParent()) return 'Portal padre de familia';
    if (this.roleContext.isTeacher()) return 'Gestion docente';
    return 'Gestion institucional';
  });

  protected readonly pageTitle = computed(() => {
    if (this.roleContext.isParent()) return 'Seguimiento academico del estudiante';
    if (this.roleContext.isTeacher()) return 'Seguimiento de estudiantes';
    return 'Seguimiento academico';
  });

  protected readonly pageSubtitle = computed(() => {
    if (this.roleContext.isParent()) {
      return 'Observaciones y estado academico del estudiante seleccionado.';
    }
    if (this.roleContext.isTeacher()) {
      return 'Registre observaciones y comunicaciones de los alumnos de sus cursos.';
    }
    return 'Registre y consulte el seguimiento academico de todos los estudiantes.';
  });

  protected readonly columns = computed<DataTableColumn[]>(() =>
    this.isParentView()
      ? [
          { key: 'fecha', label: 'Fecha' },
          { key: 'registradoPor', label: 'Registrado por' },
          { key: 'estadoAcademico', label: 'Estado' },
          { key: 'observacion', label: 'Observacion' },
        ]
      : [
          { key: 'estudiante', label: 'Estudiante' },
          { key: 'apoderado', label: 'Apoderado' },
          { key: 'nivel', label: 'Nivel' },
          { key: 'grado', label: 'Grado' },
          { key: 'seccion', label: 'Seccion' },
          { key: 'estadoAcademico', label: 'Estado academico' },
          { key: 'comunicacion', label: 'Comunicacion' },
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
    this.catalogService.estadosSeguimiento().subscribe({
      next: (items) => {
        const states = items as { codigo: string; nombre: string }[];
        this.estados.set(states);
        if (states.length && !states.some((state) => state.codigo === this.estadoCodigo())) {
          this.estadoCodigo.set(states[0].codigo);
        }
      },
    });

    if (this.roleContext.isParent()) {
      return;
    }

    this.roleContext.whenReady(() => {
      this.loadStudentsForTracking();
      this.load();
    });
  }

  protected load(): void {
    const params: Record<string, string> = {};

    if (this.roleContext.isParent()) {
      const studentId = this.parentContext.selectedStudentId();
      if (!studentId) {
        this.allRows.set([]);
        this.rawItems.set([]);
        return;
      }
      params['estudiante_id'] = studentId;
    } else if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }

    this.seguimientoService.listar(params).subscribe({
      next: (items) => {
        const list = items as SeguimientoRow[];
        this.rawItems.set(list);
        this.allRows.set(list.map((item) => this.mapToTableRow(item)));
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el seguimiento academico.');
      },
    });
  }

  protected onDetail(row: DataTableRow): void {
    const item = this.rawItems().find((record) => record['id'] === row['_id']);
    if (!item) return;

    this.selectedCase.set(item);
    this.selectedStudentId.set(item['studentId'] ?? '');
    this.observacion.set(item['notes'] ?? '');
    this.ultimaComunicacion.set(item['lastContact'] || new Date().toISOString().slice(0, 10));
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected onStudentSelection(studentId: string): void {
    this.selectedStudentId.set(studentId);
    this.selectedCase.set(null);
    this.observacion.set('');
    this.ultimaComunicacion.set(new Date().toISOString().slice(0, 10));
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected registrarComunicacion(): void {
    const user = this.auth.currentUser();
    const selectedCase = this.selectedCase();
    const studentId = selectedCase?.['studentId'] || this.selectedStudentId();

    if (!studentId || !user) {
      this.errorMessage.set('Seleccione un estudiante para registrar el seguimiento.');
      return;
    }

    this.saving.set(true);
    this.seguimientoService
      .crear({
        estudiante_id: studentId,
        apoderado_id: selectedCase?.['parentId'] || undefined,
        estado_codigo: this.estadoCodigo(),
        observacion: this.observacion().trim() || undefined,
        ultima_comunicacion: this.ultimaComunicacion() || new Date().toISOString().slice(0, 10),
        registrado_por_perfil_id: user.id,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (created) => {
          const createdCase = created as SeguimientoRow;
          this.selectedCase.set(createdCase?.['id'] ? createdCase : null);
          this.selectedStudentId.set(createdCase?.['studentId'] || studentId);
          this.successMessage.set('Seguimiento academico registrado.');
          this.errorMessage.set('');
          this.load();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo registrar el seguimiento.');
        },
      });
  }

  private loadStudentsForTracking(): void {
    const params: Record<string, string> = {};
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }

    this.studentService.listar(Object.keys(params).length ? params : undefined).subscribe({
      next: (students) => {
        this.students.set(students);
        const requestedId = this.route.snapshot.queryParamMap.get('estudianteId') ?? '';
        if (requestedId && students.some((student) => student.id === requestedId)) {
          this.onStudentSelection(requestedId);
        }
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el listado de estudiantes.');
      },
    });
  }

  private mapToTableRow(item: SeguimientoRow): DataTableRow {
    if (this.isParentView()) {
      return {
        _id: item['id'],
        _studentId: item['studentId'],
        fecha: item['lastContact'] || '-',
        registradoPor: item['registeredBy'] || item['parentName'] || '-',
        estadoAcademico: item['academicStatus'] || '-',
        observacion: item['notes'] || '-',
      };
    }

    return {
      _id: item['id'],
      _studentId: item['studentId'],
      estudiante: item['studentName'] || '-',
      apoderado: item['parentName'] || '-',
      nivel: item['level'] || '-',
      grado: item['grade'] || '-',
      seccion: item['section'] || '-',
      estadoAcademico: item['academicStatus'] || '-',
      comunicacion: item['communicationStatus'] || '-',
    };
  }
}
