import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AttendanceService } from '../../services/attendance.service';
import { CatalogService } from '../../services/catalog.service';
import { CourseService } from '../../services/course.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-attendance',
  imports: [DataTable],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class Attendance implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly courseService = inject(CourseService);
  private readonly catalogService = inject(CatalogService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);
  private readonly parentContext = inject(ParentContextService);
  private readonly studentService = inject(StudentService);

  protected readonly editId = signal('');
  protected readonly cursoId = signal('');
  protected readonly fecha = signal(new Date().toISOString().slice(0, 10));
  protected readonly estudianteId = signal('');
  protected readonly estadoCodigo = signal('PRESENTE');
  protected readonly observacion = signal('');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly draftFiltroCurso = signal('');
  protected readonly draftFiltroFecha = signal('');
  protected readonly draftFiltroEstudiante = signal('');
  protected readonly draftFiltroEstado = signal('');

  protected readonly filtroCurso = signal('');
  protected readonly filtroFecha = signal('');
  protected readonly filtroEstudiante = signal('');
  protected readonly filtroEstado = signal('');

  protected readonly cursos = signal<{ id: string; name: string; section: string }[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string; section: string }[]>([]);
  protected readonly estados = [
    { codigo: 'PRESENTE', nombre: 'Presente' },
    { codigo: 'TARDE', nombre: 'Tarde' },
    { codigo: 'FALTA', nombre: 'Falta' },
    { codigo: 'JUSTIFICADO', nombre: 'Justificado' },
  ];

  protected readonly editMode = computed(() => !!this.editId());

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
    { key: 'observacion', label: 'Observación' },
  ];

  protected readonly personalColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly columns = computed(() =>
    this.roleContext.isStudent() || this.roleContext.isParent() ? this.personalColumns : this.adminColumns,
  );

  protected readonly allRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => {
    let data = this.allRows();
    if (this.filtroEstado()) {
      const estado = this.estados.find((e) => e.codigo === this.filtroEstado())?.nombre ?? this.filtroEstado();
      data = data.filter((r) => String(r['estado']).toLowerCase().includes(estado.toLowerCase()));
    }
    return data;
  });

  protected readonly attendanceStats = computed(() => {
    const rows = this.allRows();
    let presentes = 0;
    let tardes = 0;
    let faltas = 0;
    let justificados = 0;
    for (const r of rows) {
      const codigo = String(r['_estadoCodigo'] ?? '').toUpperCase();
      if (codigo === 'PRESENTE') presentes += 1;
      else if (codigo === 'TARDE') tardes += 1;
      else if (codigo === 'FALTA') faltas += 1;
      else if (codigo === 'JUSTIFICADO') justificados += 1;
    }
    const total = rows.length;
    const asistencia = total ? Math.round(((presentes + tardes + justificados) / total) * 100) : 0;
    return { presentes, tardes, faltas, justificados, total, asistencia };
  });

  protected readonly cursoEstudiantes = computed(() => {
    const curso = this.cursos().find((c) => c.id === this.cursoId());
    if (!curso) return this.estudiantes();
    return this.estudiantes().filter((e) => e.section === curso.section);
  });

  protected readonly canEdit = computed(
    () => this.roleContext.isTeacher() || this.roleContext.isInstitutional(),
  );

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.studentContext.ensureLoaded();
      this.cursos.set(
        this.studentContext.courses().map((c) => ({ id: c.id, name: c.name, section: '' })),
      );
      this.loadAsistencia();
    });
  }

  ngOnInit(): void {
    this.draftFiltroFecha.set(this.fecha());
    this.filtroFecha.set(this.fecha());

    this.roleContext.whenReady(() => {
      if (!this.roleContext.isTeacher() && !this.roleContext.requiresStudentScope()) {
        this.catalogService.estudiantes().subscribe({
          next: (s) =>
            this.estudiantes.set(
              (s as { id: string; fullName: string; section: string }[]).map((e) => ({
                id: e.id,
                fullName: e.fullName,
                section: e.section,
              })),
            ),
        });
      }

      if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
        this.loadEstudiantesDocente();
        this.courseService.listar({ docente_id: this.roleContext.getTeacherId()! }).subscribe({
          next: (c) =>
            this.cursos.set(c.map((x) => ({ id: x.id, name: x.label ?? x.name, section: x.section }))),
        });
      } else if (this.roleContext.isStudent() || this.roleContext.isParent()) {
        this.studentContext.ensureLoaded();
        this.cursos.set(
          this.studentContext.courses().map((c) => ({ id: c.id, name: c.name, section: '' })),
        );
      } else {
        this.courseService.listar().subscribe({
          next: (c) =>
            this.cursos.set(c.map((x) => ({ id: x.id, name: x.label ?? x.name, section: x.section }))),
        });
      }

      this.loadAsistencia();
    });
  }

  protected buscar(): void {
    this.filtroCurso.set(this.draftFiltroCurso());
    this.filtroFecha.set(this.draftFiltroFecha());
    this.filtroEstudiante.set(this.draftFiltroEstudiante());
    this.filtroEstado.set(this.draftFiltroEstado());
    this.loadAsistencia();
  }

  protected loadAsistencia(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.allRows.set([]);
      return;
    }

    const params: Record<string, string> = {};
    if (this.filtroCurso()) params['curso_id'] = this.filtroCurso();
    if (this.filtroFecha()) params['fecha'] = this.filtroFecha();
    if (this.filtroEstudiante()) params['estudiante_id'] = this.filtroEstudiante();
    if ((this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()) {
      params['estudiante_id'] = this.roleContext.getStudentId()!;
    }
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }

    this.attendanceService.listar(params).subscribe({
      next: (records) =>
        this.allRows.set(
          records.map((r) => ({
            _id: r.id,
            fecha: r.date,
            estudiante: r.studentName,
            curso: r.course,
            estado: r.status,
            observacion: r.notes || '—',
            _estudianteId: r.studentId,
            _cursoId: r.courseId,
            _fecha: r.date,
            _estadoCodigo: r.statusCode,
            _observacion: r.notes ?? '',
          })),
        ),
    });
  }

  protected guardarAsistencia(): void {
    if (!this.cursoId() || !this.estudianteId()) return;
    if (this.roleContext.isTeacher() && !this.roleContext.getTeacherId()) return;

    this.errorMessage.set('');
    const payload = {
      estudiante_id: this.estudianteId(),
      curso_asignado_id: this.cursoId(),
      estado_codigo: this.estadoCodigo(),
      fecha: this.fecha(),
      observacion: this.observacion().trim() || undefined,
      registrado_por_docente_id: this.roleContext.getTeacherId() ?? undefined,
    };

    const request = this.editId()
      ? this.attendanceService.actualizar(this.editId(), payload)
      : this.attendanceService.registrar(payload);

    request.subscribe({
      next: () => {
        this.successMessage.set(this.editId() ? 'Asistencia actualizada.' : 'Asistencia registrada.');
        this.cancelarEdicion();
        this.loadAsistencia();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar la asistencia.'),
    });
  }

  protected editarAsistencia(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.editId.set(String(id));
    this.cursoId.set(String(row['_cursoId'] ?? ''));
    this.fecha.set(String(row['_fecha'] ?? row['fecha'] ?? ''));
    this.estudianteId.set(String(row['_estudianteId'] ?? ''));
    this.estadoCodigo.set(String(row['_estadoCodigo'] ?? 'PRESENTE'));
    this.observacion.set(String(row['_observacion'] ?? ''));
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.roleContext.isTeacher() && row['_cursoId']) {
      this.loadEstudiantesDocente(String(row['_cursoId']));
    }
  }

  protected cancelarEdicion(): void {
    this.editId.set('');
    this.estudianteId.set('');
    this.observacion.set('');
    this.estadoCodigo.set('PRESENTE');
  }

  protected onCursoChange(cursoId: string): void {
    this.cursoId.set(cursoId);
    this.estudianteId.set('');
    if (this.roleContext.isTeacher()) {
      this.loadEstudiantesDocente(cursoId);
    }
  }

  private loadEstudiantesDocente(cursoId?: string): void {
    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId) return;
    const params: Record<string, string> = { docente_id: docenteId };
    if (cursoId) params['curso_id'] = cursoId;
    this.studentService.listar(params).subscribe({
      next: (students) =>
        this.estudiantes.set(
          students.map((e) => ({
            id: e.id,
            fullName: e.fullName,
            section: e.section ?? '',
          })),
        ),
    });
  }
}
