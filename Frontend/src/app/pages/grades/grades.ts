import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { CatalogService } from '../../services/catalog.service';
import { CourseService } from '../../services/course.service';
import { GradeService } from '../../services/grade.service';
import { RoleContextService } from '../../services/role-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-grades',
  imports: [DataTable, NgClass],
  templateUrl: './grades.html',
  styleUrl: './grades.scss',
})
export class Grades implements OnInit {
  private readonly gradeService = inject(GradeService);
  private readonly catalogService = inject(CatalogService);
  private readonly courseService = inject(CourseService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);
  private readonly parentContext = inject(ParentContextService);
  private readonly studentService = inject(StudentService);

  protected readonly draftStudentPeriodoId = signal('');
  protected readonly draftStudentCursoId = signal('');
  protected readonly studentPeriodoId = signal<string | null>(null);
  protected readonly studentCursoId = signal<string | null>(null);

  protected readonly draftAnioId = signal('');
  protected readonly draftNivelId = signal('');
  protected readonly draftGradoId = signal('');
  protected readonly draftSeccionId = signal('');
  protected readonly draftCursoId = signal('');
  protected readonly draftEstudianteId = signal('');
  protected readonly draftSoloBajoRendimiento = signal(false);

  protected readonly anioId = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly cursoId = signal('');
  protected readonly estudianteId = signal('');
  protected readonly soloBajoRendimiento = signal(false);

  protected readonly draftTeacherFiltroCurso = signal('');
  protected readonly teacherFiltroCurso = signal('');

  protected readonly teacherCursoId = signal('');
  protected readonly teacherEstudianteId = signal('');
  protected readonly periodoId = signal('');
  protected readonly tipoEvalId = signal('');
  protected readonly nombreEval = signal('');
  protected readonly nota = signal(0);
  protected readonly peso = signal(1);
  protected readonly observacionNota = signal('');
  protected readonly gradeSuccess = signal('');
  protected readonly gradeError = signal('');

  protected readonly editGradeId = signal('');
  protected readonly editMode = computed(() => !!this.editGradeId());

  protected readonly anios = signal<{ id: string; anio: number }[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<{ id: string; nombre: string }[]>([]);
  protected readonly secciones = signal<{ id: string; nombre: string }[]>([]);
  protected readonly cursos = signal<{ id: string; name: string }[]>([]);
  protected readonly teacherCursos = signal<{ id: string; name: string }[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string }[]>([]);
  protected readonly periodos = signal<{ id: string; nombre: string }[]>([]);
  protected readonly tiposEval = signal<{ id: string; nombre: string }[]>([]);

  protected readonly columns = computed<DataTableColumn[]>(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return [
        { key: 'curso', label: 'Curso' },
        { key: 'evaluacion', label: 'Evaluación' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'periodo', label: 'Periodo' },
        { key: 'nota', label: 'Nota' },
        { key: 'peso', label: 'Peso' },
        { key: 'estado', label: 'Estado' },
      ];
    }
    return [
      { key: 'estudiante', label: 'Estudiante' },
      { key: 'curso', label: 'Curso' },
      { key: 'seccion', label: 'Sección' },
      { key: 'evaluacion', label: 'Evaluación' },
      { key: 'nota', label: 'Nota' },
      { key: 'estado', label: 'Estado' },
    ];
  });

  protected readonly allRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => {
    let data = this.allRows();
    if (this.soloBajoRendimiento()) {
      data = data.filter((r) => {
        const n = parseFloat(String(r['nota'] ?? '0'));
        return !isNaN(n) && n < 11;
      });
    }
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      if (this.studentCursoId()) {
        data = data.filter((r) => r['_cursoId'] === this.studentCursoId());
      }
      if (this.studentPeriodoId()) {
        data = data.filter((r) => r['_periodoId'] === this.studentPeriodoId());
      }
    }
    return data;
  });

  protected readonly generalAverage = computed(() => {
    const rows = this.rows();
    let sumaNota = 0;
    let sumaPeso = 0;
    for (const r of rows) {
      const nota = parseFloat(String(r['nota'] ?? '0'));
      const peso = parseFloat(String(r['peso'] ?? '1'));
      if (!isNaN(nota) && !isNaN(peso) && peso > 0) {
        sumaNota += nota * peso;
        sumaPeso += peso;
      }
    }
    return sumaPeso > 0 ? Math.round((sumaNota / sumaPeso) * 100) / 100 : null;
  });

  protected readonly studentCursos = computed(() => {
    const map = new Map<string, string>();
    for (const r of this.allRows()) {
      const id = String(r['_cursoId'] ?? '');
      if (id) map.set(id, String(r['curso'] ?? ''));
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  });

  protected readonly selectedCursoName = computed(
    () => this.teacherCursos().find((c) => c.id === this.teacherCursoId())?.name ?? '',
  );

  protected readonly selectedEstudianteName = computed(
    () => this.estudiantes().find((e) => e.id === this.teacherEstudianteId())?.fullName ?? '',
  );

  protected readonly selectedPeriodoName = computed(
    () => this.periodos().find((p) => p.id === this.periodoId())?.nombre ?? '',
  );

  protected readonly selectedTipoName = computed(
    () => this.tiposEval().find((t) => t.id === this.tipoEvalId())?.nombre ?? '',
  );

  protected readonly estudiantesEnCurso = computed(() => this.estudiantes().length);

  protected readonly gradeStatus = computed(() => {
    const n = this.nota();
    if (n >= 14) {
      return { label: 'Destacado', className: 'grades-score-badge--excellent', hint: 'Rendimiento sobresaliente (≥ 14)' };
    }
    if (n >= 11) {
      return { label: 'Aprobado', className: 'grades-score-badge--pass', hint: 'Nota aprobatoria (11 – 13)' };
    }
    if (n > 0) {
      return { label: 'Desaprobado', className: 'grades-score-badge--fail', hint: 'Requiere refuerzo académico (< 11)' };
    }
    return { label: 'Pendiente', className: 'grades-score-badge--neutral', hint: 'Ingrese la nota obtenida (0 – 20)' };
  });

  protected readonly gradeMeterPercent = computed(() => Math.min(100, Math.max(0, (this.nota() / 20) * 100)));

  protected readonly nombreEvalPlaceholder = computed(() => {
    const tipo = this.selectedTipoName();
    if (!tipo) return 'Ej. Examen bimestral, práctica calificada…';
    return `Ej. ${tipo} — unidad 1`;
  });

  protected readonly canSaveGrade = computed(() => {
    if (this.editMode()) {
      return this.nota() >= 0 && this.nota() <= 20 && this.peso() > 0;
    }
    return (
      !!this.teacherCursoId() &&
      !!this.teacherEstudianteId() &&
      !!this.periodoId() &&
      !!this.tipoEvalId() &&
      this.nota() >= 0 &&
      this.nota() <= 20 &&
      this.peso() > 0
    );
  });

  protected readonly showGradePreview = computed(
    () =>
      !this.editMode() &&
      !!this.teacherCursoId() &&
      !!this.teacherEstudianteId() &&
      !!this.periodoId() &&
      !!this.tipoEvalId(),
  );

  protected readonly step2Touched = signal(false);

  protected readonly step1Complete = computed(
    () => !!this.teacherCursoId() && !!this.teacherEstudianteId(),
  );

  protected readonly step2Complete = computed(
    () =>
      this.step1Complete() &&
      this.step2Touched() &&
      !!this.periodoId() &&
      !!this.tipoEvalId(),
  );

  protected readonly currentFormStep = computed(() => {
    if (!this.step1Complete()) return 1;
    if (!this.step2Complete()) return 2;
    return 3;
  });

  protected readonly currentStepHint = computed(() => {
    switch (this.currentFormStep()) {
      case 1:
        return 'Paso 1 de 3 — Comience seleccionando el curso y el estudiante.';
      case 2:
        return 'Paso 2 de 3 — Revise periodo y tipo, luego pulse «Confirmar periodo y continuar».';
      default:
        return 'Paso 3 de 3 — Asigne la nota, revise la vista previa y registre.';
    }
  });

  protected isStepDone(step: number): boolean {
    switch (step) {
      case 1:
        return this.step1Complete();
      case 2:
        return this.step2Complete();
      case 3:
        return this.canSaveGrade();
      default:
        return false;
    }
  }

  protected isStepActive(step: number): boolean {
    return this.currentFormStep() === step;
  }

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.loadGrades();
    });
  }

  ngOnInit(): void {
    this.catalogService.anios().subscribe({
      next: (a) => {
        const list = a as { id: string; anio: number }[];
        this.anios.set(list);
        if (list.length) {
          this.anioId.set(list[0].id);
          this.draftAnioId.set(list[0].id);
          this.loadPeriodos(list[0].id);
        }
      },
    });
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    if (!this.roleContext.isTeacher() && !this.roleContext.requiresStudentScope()) {
      this.catalogService.estudiantes().subscribe({
        next: (s) =>
          this.estudiantes.set(
            (s as { id: string; fullName: string }[]).map((e) => ({ id: e.id, fullName: e.fullName })),
          ),
      });
    }
    this.catalogService.tiposEvaluacion().subscribe({
      next: (t) => {
        const list = t as { id: string; nombre: string }[];
        this.tiposEval.set(list);
        if (list.length) this.tipoEvalId.set(list[0].id);
      },
    });

    this.roleContext.whenReady(() => {
      if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
        this.courseService.listar({ docente_id: this.roleContext.getTeacherId()! }).subscribe({
          next: (c) => this.teacherCursos.set(c.map((x) => ({ id: x.id, name: x.label ?? x.name }))),
        });
      }
      if (this.roleContext.isStudent()) {
        this.studentContext.ensureLoaded();
      }
      this.loadGrades();
    });
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
    if (this.draftAnioId() && gradoId) {
      this.catalogService.secciones(this.draftAnioId(), gradoId).subscribe({
        next: (s) => this.secciones.set(s as { id: string; nombre: string }[]),
      });
    } else {
      this.secciones.set([]);
    }
  }

  protected buscar(): void {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      this.studentPeriodoId.set(this.draftStudentPeriodoId() || null);
      this.studentCursoId.set(this.draftStudentCursoId() || null);
      return;
    }
    if (this.roleContext.isTeacher()) {
      this.teacherFiltroCurso.set(this.draftTeacherFiltroCurso());
      this.loadGrades();
      return;
    }
    this.anioId.set(this.draftAnioId());
    this.nivelId.set(this.draftNivelId());
    this.gradoId.set(this.draftGradoId());
    this.seccionId.set(this.draftSeccionId());
    this.cursoId.set(this.draftCursoId());
    this.estudianteId.set(this.draftEstudianteId());
    this.soloBajoRendimiento.set(this.draftSoloBajoRendimiento());
    this.loadCursos();
    this.loadGrades();
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
    this.loadGrades();
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    this.catalogService.secciones(this.anioId(), gradoId || undefined).subscribe({
      next: (s) => this.secciones.set(s as { id: string; nombre: string }[]),
    });
    this.loadCursos();
    this.loadGrades();
  }

  protected loadCursos(): void {
    const params: Record<string, string> = {};
    if (this.anioId()) params['anio_id'] = this.anioId();
    if (this.seccionId()) params['seccion_id'] = this.seccionId();
    this.courseService.listar(params).subscribe({
      next: (c) => this.cursos.set(c.map((x) => ({ id: x.id, name: x.label ?? x.name }))),
    });
  }

  protected loadPeriodos(anioId: string): void {
    this.catalogService.periodos(anioId).subscribe({
      next: (p) => {
        const list = p as { id: string; nombre: string }[];
        this.periodos.set(list);
        if (list.length) this.periodoId.set(list[0].id);
      },
    });
  }

  protected loadGrades(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.allRows.set([]);
      return;
    }

    const params: Record<string, string> = {};
    if (this.cursoId()) params['curso_id'] = this.cursoId();
    if (this.estudianteId()) params['estudiante_id'] = this.estudianteId();
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
      if (this.teacherFiltroCurso()) params['curso_id'] = this.teacherFiltroCurso();
    }
    if ((this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()) {
      params['estudiante_id'] = this.roleContext.getStudentId()!;
    }

    this.gradeService.listar(params).subscribe({
      next: (grades) => {
        let mapped = grades.map((g) => ({
          _id: g.id,
          estudiante: g.studentName ?? '—',
          curso: g.course,
          seccion: (g as { section?: string }).section ?? '—',
          evaluacion: g.evaluation ?? g.type ?? '—',
          tipo: (g as { type?: string }).type ?? '—',
          periodo: (g as { period?: string }).period ?? '—',
          nota: g.grade,
          peso: (g as { weight?: string }).weight ?? '1',
          estado: g.status,
          _observacion: (g as { observation?: string }).observation ?? '',
          _cursoId: g.courseId ?? '',
          _periodoId: g.periodId ?? '',
        }));
        if (this.seccionId()) {
          mapped = mapped.filter((r) => String(r.seccion).includes(this.seccionLabel()));
        }
        this.allRows.set(mapped);
      },
    });
  }

  protected onPeriodoChange(periodoId: string): void {
    this.periodoId.set(periodoId);
    if (this.step1Complete()) {
      this.step2Touched.set(true);
    }
  }

  protected onTipoEvalChange(tipoId: string): void {
    this.tipoEvalId.set(tipoId);
    if (this.step1Complete()) {
      this.step2Touched.set(true);
    }
  }

  protected confirmStep2(): void {
    if (this.step1Complete() && this.periodoId() && this.tipoEvalId()) {
      this.step2Touched.set(true);
    }
  }

  protected onNotaInput(value: string): void {
    const parsed = parseFloat(value);
    this.nota.set(Number.isFinite(parsed) ? parsed : 0);
  }

  protected onNotaRangeInput(value: string): void {
    this.nota.set(parseFloat(value) || 0);
  }

  protected onTeacherCursoChange(cursoId: string): void {
    this.teacherCursoId.set(cursoId);
    this.teacherEstudianteId.set('');
    this.step2Touched.set(false);
    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId || !cursoId) {
      this.estudiantes.set([]);
      return;
    }
    this.studentService.listar({ docente_id: docenteId, curso_id: cursoId }).subscribe({
      next: (students) =>
        this.estudiantes.set(students.map((e) => ({ id: e.id, fullName: e.fullName }))),
    });
  }

  protected guardarCalificacion(): void {
    const docenteId = this.roleContext.getTeacherId();
    if (this.editGradeId()) {
      if (!docenteId) return;
      this.gradeService
        .actualizar(this.editGradeId(), {
          nombre_evaluacion: this.nombreEval() || undefined,
          nota: this.nota(),
          peso: this.peso(),
          observacion: this.observacionNota().trim() || undefined,
          docente_id: docenteId,
        })
        .subscribe({
          next: () => {
            this.gradeSuccess.set('Calificación actualizada correctamente.');
            this.gradeError.set('');
            this.cancelarEdicionNota();
            this.loadGrades();
          },
          error: (err) => this.gradeError.set(err?.error?.detail ?? 'No se pudo actualizar la calificación.'),
        });
      return;
    }

    if (!docenteId || !this.teacherCursoId() || !this.teacherEstudianteId() || !this.periodoId() || !this.tipoEvalId()) {
      this.gradeError.set('Complete curso, estudiante, periodo y tipo de evaluación.');
      return;
    }
    this.gradeService
      .crear({
        estudiante_id: this.teacherEstudianteId(),
        curso_asignado_id: this.teacherCursoId(),
        periodo_academico_id: this.periodoId(),
        tipo_evaluacion_id: this.tipoEvalId(),
        nombre_evaluacion: this.nombreEval() || 'Evaluación',
        nota: this.nota(),
        peso: this.peso(),
        observacion: this.observacionNota().trim() || undefined,
        registrado_por_docente_id: docenteId,
      })
      .subscribe({
        next: () => {
          this.gradeSuccess.set('Calificación guardada correctamente.');
          this.gradeError.set('');
          this.teacherEstudianteId.set('');
          this.nombreEval.set('');
          this.nota.set(0);
          this.peso.set(1);
          this.observacionNota.set('');
          this.loadGrades();
        },
        error: (err) => this.gradeError.set(err?.error?.detail ?? 'No se pudo guardar la calificación.'),
      });
  }

  protected editarNota(row: DataTableRow): void {
    if (!this.roleContext.isTeacher()) return;
    const id = row['_id'];
    if (!id) return;
    this.editGradeId.set(String(id));
    this.nombreEval.set(String(row['evaluacion'] ?? ''));
    this.nota.set(parseFloat(String(row['nota'] ?? '0')) || 0);
    this.peso.set(parseFloat(String(row['peso'] ?? '1')) || 1);
    this.observacionNota.set(String(row['_observacion'] ?? ''));
    this.gradeSuccess.set('');
    this.gradeError.set('');
  }

  protected cancelarEdicionNota(): void {
    const wasEdit = this.editMode();
    this.editGradeId.set('');
    this.nombreEval.set('');
    this.nota.set(0);
    this.peso.set(1);
    this.observacionNota.set('');
    this.gradeSuccess.set('');
    this.gradeError.set('');
    if (!wasEdit) {
      this.teacherEstudianteId.set('');
    }
  }

  protected limpiarFormularioRegistro(): void {
    this.editGradeId.set('');
    this.teacherEstudianteId.set('');
    this.step2Touched.set(false);
    this.nombreEval.set('');
    this.nota.set(0);
    this.peso.set(1);
    this.observacionNota.set('');
    this.gradeSuccess.set('');
    this.gradeError.set('');
  }

  private seccionLabel(): string {
    return this.secciones().find((s) => s.id === this.seccionId())?.nombre ?? '';
  }
}
