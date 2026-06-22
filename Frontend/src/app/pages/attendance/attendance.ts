import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AttendanceService } from '../../services/attendance.service';
import { CatalogService } from '../../services/catalog.service';
import { CourseService } from '../../services/course.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { StudentService } from '../../services/student.service';

interface AttendanceDraft {
  studentId: string;
  fullName: string;
  statusCode: string;
  observation: string;
  existingId?: string;
}

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
  public readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);
  private readonly parentContext = inject(ParentContextService);
  private readonly studentService = inject(StudentService);

  public readonly editId = signal('');
  public readonly cursoId = signal('');
  public readonly fecha = signal(new Date().toISOString().slice(0, 10));
  public readonly estudianteId = signal('');
  public readonly estadoCodigo = signal('PRESENTE');
  public readonly observacion = signal('');
  public readonly saving = signal(false);
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');

  public readonly draftFiltroCurso = signal('');
  public readonly draftFiltroFecha = signal('');
  public readonly draftFiltroEstudiante = signal('');
  public readonly draftFiltroEstado = signal('');

  public readonly filtroCurso = signal('');
  public readonly filtroFecha = signal('');
  public readonly filtroEstudiante = signal('');
  public readonly filtroEstado = signal('');

  public readonly cursos = signal<{ id: string; name: string; section: string }[]>([]);
  public readonly estudiantes = signal<{ id: string; fullName: string; section: string }[]>([]);
  public readonly attendanceDrafts = signal<AttendanceDraft[]>([]);
  public readonly estados = [
    { codigo: 'PRESENTE', nombre: 'Presente' },
    { codigo: 'TARDE', nombre: 'Tarde' },
    { codigo: 'FALTA', nombre: 'Falta' },
    { codigo: 'JUSTIFICADO', nombre: 'Justificado' },
  ];

  public readonly editMode = computed(() => !!this.editId());

  public readonly adminColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
    { key: 'observacion', label: 'Observación' },
  ];

  public readonly personalColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly columns = computed(() =>
    this.roleContext.isStudent() || this.roleContext.isParent() ? this.personalColumns : this.adminColumns,
  );

  public readonly allRows = signal<DataTableRow[]>([]);
  public readonly selectedAttendance = signal<DataTableRow | null>(null);

  public readonly rows = computed(() => {
    let data = this.allRows();
    if (this.filtroEstado()) {
      const estado = this.estados.find((e) => e.codigo === this.filtroEstado())?.nombre ?? this.filtroEstado();
      data = data.filter((r) => String(r['estado']).toLowerCase().includes(estado.toLowerCase()));
    }
    return data;
  });

  public readonly attendanceStats = computed(() => {
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

  public readonly cursoEstudiantes = computed(() => {
    const curso = this.cursos().find((c) => c.id === this.cursoId());
    if (!curso) return this.estudiantes();
    return this.estudiantes().filter((e) => e.section === curso.section);
  });

  public readonly selectedCourse = computed(() => this.cursos().find((c) => c.id === this.cursoId()) ?? null);

  public readonly canEdit = computed(
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
    this.draftFiltroFecha.set('');
    this.filtroFecha.set('');

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

  public buscar(): void {
    this.filtroCurso.set(this.draftFiltroCurso());
    this.filtroFecha.set(this.draftFiltroFecha());
    this.filtroEstudiante.set(this.draftFiltroEstudiante());
    this.filtroEstado.set(this.draftFiltroEstado());
    this.loadAsistencia();
  }

  public loadAsistencia(): void {
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
      next: (records) => {
        const rows = records.map((r) => ({
            _id: r.id,
            fecha: r.date,
            estudiante: r.studentName,
            curso: r.course,
            seccion: r.section || '-',
            estado: r.status,
            observacion: r.notes || '—',
            _estudianteId: r.studentId,
            _cursoId: r.courseId,
            _fecha: r.date,
            _estadoCodigo: r.statusCode,
            _observacion: r.notes ?? '',
        }));
        this.allRows.set(rows);
        const selectedId = this.selectedAttendance()?.['_id'];
        if (selectedId && !rows.some((row) => row['_id'] === selectedId)) {
          this.selectedAttendance.set(null);
        }
      },
    });
  }

  public guardarAsistencia(): void {
    if (this.roleContext.isTeacher()) {
      this.guardarAsistenciaLote();
      return;
    }

    if (!this.cursoId() || !this.estudianteId()) return;

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

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.successMessage.set(this.editId() ? 'Asistencia actualizada.' : 'Asistencia registrada.');
        this.cancelarEdicion();
        this.loadAsistencia();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar la asistencia.'),
    });
  }

  public editarAsistencia(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    if (this.roleContext.isTeacher()) {
      const cursoId = String(row['_cursoId'] ?? '');
      this.editId.set('');
      this.cursoId.set(cursoId);
      this.fecha.set(String(row['_fecha'] ?? row['fecha'] ?? this.fecha()));
      this.successMessage.set('');
      this.errorMessage.set('');
      this.loadEstudiantesDocente(cursoId, true);
      return;
    }
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

  public verDetalleAsistencia(row: DataTableRow): void {
    this.selectedAttendance.set(row);
  }

  public onTableDetail(row: DataTableRow): void {
    if (this.canEdit()) {
      this.editarAsistencia(row);
      return;
    }

    this.verDetalleAsistencia(row);
  }

  public cancelarEdicion(): void {
    this.editId.set('');
    this.estudianteId.set('');
    this.observacion.set('');
    this.estadoCodigo.set('PRESENTE');
  }

  public onCursoChange(cursoId: string): void {
    this.cursoId.set(cursoId);
    this.estudianteId.set('');
    this.editId.set('');
    this.attendanceDrafts.set([]);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.roleContext.isTeacher()) {
      this.loadEstudiantesDocente(cursoId, true);
    }
  }

  public onFechaChange(value: string): void {
    this.fecha.set(value);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.roleContext.isTeacher() && this.cursoId()) {
      this.loadAttendanceDrafts();
    }
  }

  public updateDraftStatus(studentId: string, statusCode: string): void {
    this.attendanceDrafts.update((items) =>
      items.map((item) => (item.studentId === studentId ? { ...item, statusCode } : item)),
    );
  }

  public updateDraftObservation(studentId: string, observation: string): void {
    this.attendanceDrafts.update((items) =>
      items.map((item) => (item.studentId === studentId ? { ...item, observation } : item)),
    );
  }

  public markAll(statusCode: string): void {
    this.attendanceDrafts.update((items) => items.map((item) => ({ ...item, statusCode })));
  }

  private guardarAsistenciaLote(): void {
    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId) return;
    if (!this.cursoId() || !this.fecha()) {
      this.errorMessage.set('Seleccione curso y fecha para registrar asistencia.');
      return;
    }
    if (!this.attendanceDrafts().length) {
      this.errorMessage.set('No hay estudiantes disponibles para este curso.');
      return;
    }

    const payload = this.attendanceDrafts().map((row) => ({
      estudiante_id: row.studentId,
      curso_asignado_id: this.cursoId(),
      estado_codigo: row.statusCode,
      fecha: this.fecha(),
      observacion: row.observation.trim() || undefined,
      registrado_por_docente_id: docenteId,
    }));

    this.errorMessage.set('');
    this.successMessage.set('');
    this.saving.set(true);
    this.attendanceService
      .registrarLote(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(`Asistencia registrada para ${payload.length} estudiante${payload.length === 1 ? '' : 's'}.`);
          this.loadAttendanceDrafts();
          this.loadAsistencia();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar la asistencia del salón.'),
      });
  }

  private loadEstudiantesDocente(cursoId?: string, prepareRoster = false): void {
    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId) return;
    const params: Record<string, string> = { docente_id: docenteId };
    if (cursoId) params['curso_id'] = cursoId;
    this.studentService.listar(params).subscribe({
      next: (students) => {
        const mapped = students.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          section: e.section ?? '',
        }));
        this.estudiantes.set(mapped);
        if (prepareRoster) {
          this.loadAttendanceDrafts(mapped);
        }
      },
    });
  }

  public loadAttendanceDrafts(students = this.cursoEstudiantes()): void {
    if (!this.cursoId() || !this.fecha()) {
      this.attendanceDrafts.set([]);
      return;
    }

    const params: Record<string, string> = {
      curso_id: this.cursoId(),
      fecha: this.fecha(),
    };
    const docenteId = this.roleContext.getTeacherId();
    if (docenteId) params['docente_id'] = docenteId;

    this.attendanceService.listar(params).subscribe({
      next: (records) => {
        const byStudent = new Map(records.map((record) => [record.studentId, record]));
        this.attendanceDrafts.set(
          students.map((student) => {
            const existing = byStudent.get(student.id);
            return {
              studentId: student.id,
              fullName: student.fullName,
              statusCode: existing?.statusCode || 'PRESENTE',
              observation: existing?.notes ?? '',
              existingId: existing?.id,
            };
          }),
        );
      },
      error: () => {
        this.attendanceDrafts.set(
          students.map((student) => ({
            studentId: student.id,
            fullName: student.fullName,
            statusCode: 'PRESENTE',
            observation: '',
          })),
        );
      },
    });
  }
}
