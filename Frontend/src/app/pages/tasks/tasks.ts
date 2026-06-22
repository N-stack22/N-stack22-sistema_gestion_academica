import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { Task, TaskSubmission } from '../../interfaces/task';
import { CourseService } from '../../services/course.service';
import { TaskService } from '../../services/task.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { isRequired, minLength } from '../../utils/form-validation';

type StudentTaskTab = 'pendientes' | 'entregadas' | 'calificadas' | 'vencidas';

@Component({
  selector: 'app-tasks',
  imports: [DataTable],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly courseService = inject(CourseService);
  public readonly roleContext = inject(RoleContextService);
  private readonly parentContext = inject(ParentContextService);

  public readonly title = signal('');
  public readonly descripcion = signal('');
  public readonly cursoId = signal('');
  public readonly dueDate = signal('');
  public readonly submitted = signal(false);
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');

  public readonly draftFiltroCurso = signal('');
  public readonly draftFiltroBusqueda = signal('');
  public readonly filtroCurso = signal('');
  public readonly filtroBusqueda = signal('');
  public readonly cursos = signal<{ id: string; name: string }[]>([]);

  public readonly selectedTaskId = signal('');
  public readonly selectedTaskTitle = signal('');
  public readonly entregas = signal<TaskSubmission[]>([]);
  public readonly entregasLoading = signal(false);
  public readonly entregaError = signal('');
  public readonly entregaSuccess = signal('');
  public readonly gradingEntregaId = signal('');
  public readonly gradingNota = signal(0);
  public readonly gradingFeedback = signal('');

  public readonly gradingEntrega = computed(() => {
    const id = this.gradingEntregaId();
    if (!id) return null;
    return this.entregas().find((e) => e.id === id) ?? null;
  });

  public readonly studentTab = signal<StudentTaskTab>('pendientes');
  public readonly tasks = signal<Task[]>([]);
  public readonly selectedStudentTask = signal<Task | null>(null);
  public readonly deliveryComment = signal('');
  public readonly deliveryUrl = signal('');
  public readonly selectedFile = signal<File | null>(null);
  public readonly isUploading = signal(false);
  public readonly deliverySubmitted = signal(false);
  public readonly deliveryError = signal('');
  public readonly deliverySuccess = signal('');

  public readonly tasksLoading = signal(false);
  public readonly tasksError = signal('');

  public readonly titleError = computed(() => {
    if (!this.submitted() && !this.title()) return '';
    return isRequired(this.title(), 'El título es obligatorio.') || minLength(this.title(), 4, 'Mínimo 4 caracteres.');
  });

  public readonly courseError = computed(() => {
    if (!this.submitted() && !this.cursoId()) return '';
    return isRequired(this.cursoId(), 'Seleccione un curso.');
  });

  public readonly dueDateError = computed(() => {
    if (!this.submitted() && !this.dueDate()) return '';
    return isRequired(this.dueDate(), 'La fecha de entrega es obligatoria.');
  });

  public readonly isFormValid = computed(
    () => !this.titleError() && !this.courseError() && !this.dueDateError(),
  );

  public readonly showEntregas = computed(() => !!this.selectedTaskId() && this.roleContext.isTeacher());

  public readonly canSubmitDelivery = computed(() => {
    const task = this.selectedStudentTask();
    if (!task || task.deliveryStatusCode === 'CALIFICADA' || task.statusCode === 'CERRADA') return false;
    return !!(this.deliveryUrl().trim() || this.selectedFile());
  });

  public readonly pendingTasks = computed(() =>
    this.tasks().filter((t) => !t.submitted && !t.overdue),
  );
  public readonly deliveredTasks = computed(() =>
    this.tasks().filter((t) => t.submitted && t.deliveryStatusCode !== 'CALIFICADA'),
  );
  public readonly gradedTasks = computed(() =>
    this.tasks().filter((t) => t.deliveryStatusCode === 'CALIFICADA'),
  );
  public readonly overdueTasks = computed(() =>
    this.tasks().filter((t) => t.overdue && !t.submitted),
  );

  public readonly studentTabTasks = computed(() => {
    switch (this.studentTab()) {
      case 'entregadas':
        return this.deliveredTasks();
      case 'calificadas':
        return this.gradedTasks();
      case 'vencidas':
        return this.overdueTasks();
      default:
        return this.pendingTasks();
    }
  });

  public readonly entregaColumns: DataTableColumn[] = [
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'codigo', label: 'Código' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha entrega' },
    { key: 'adjunto', label: 'Adjunto' },
    { key: 'nota', label: 'Nota' },
  ];

  public readonly studentColumns: DataTableColumn[] = [
    { key: 'tarea', label: 'Tarea' },
    { key: 'curso', label: 'Curso' },
    { key: 'docente', label: 'Docente' },
    { key: 'fecha', label: 'Fecha entrega' },
    { key: 'estado', label: 'Estado' },
    { key: 'nota', label: 'Nota' },
  ];

  public readonly entregaRows = computed<DataTableRow[]>(() =>
    this.entregas().map((e) => ({
      _id: e.id,
      _submitted: e.submitted ? '1' : '0',
      estudiante: e.studentName,
      codigo: e.studentCode,
      estado: e.status,
      fecha: e.submittedAt || '—',
      adjunto: this.formatEntregaAdjunto(e.fileUrl),
      nota: e.grade || '—',
      _feedback: e.feedback,
      _fileUrl: e.fileUrl,
      _description: e.description ?? '',
    })),
  );

  public readonly columns: DataTableColumn[] = [
    { key: 'tarea', label: 'Tarea' },
    { key: 'curso', label: 'Curso' },
    { key: 'seccion', label: 'Sección' },
    { key: 'docente', label: 'Docente' },
    { key: 'fecha', label: 'Fecha de entrega' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly studentRows = computed<DataTableRow[]>(() => {
    const q = this.filtroBusqueda().trim().toLowerCase();
    let tasks = this.studentTabTasks();
    if (q) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.course.toLowerCase().includes(q) ||
          (t.teacher ?? '').toLowerCase().includes(q),
      );
    }
    return tasks.map((task) => ({
      _id: task.id,
      tarea: task.title,
      curso: task.course,
      docente: task.teacher ?? '—',
      fecha: task.dueDate,
      estado: task.deliveryStatus ?? (task.submitted ? 'Entregada' : task.overdue ? 'Vencida' : 'Pendiente'),
      nota: task.deliveryGrade || '—',
      _taskJson: JSON.stringify(task),
    }));
  });

  public readonly allRows = signal<DataTableRow[]>([]);

  public readonly rows = computed(() => {
    const q = this.filtroBusqueda().trim().toLowerCase();
    let data = this.allRows();
    if (!q) return data;
    return data.filter((r) => {
      const tarea = String(r['tarea'] ?? '').toLowerCase();
      const curso = String(r['curso'] ?? '').toLowerCase();
      const docente = String(r['docente'] ?? '').toLowerCase();
      return tarea.includes(q) || curso.includes(q) || docente.includes(q);
    });
  });

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.selectedStudentTask.set(null);
      this.loadTasks();
    });
  }

  ngOnInit(): void {
    if (!this.roleContext.isStudent() && !this.roleContext.isParent()) {
      this.roleContext.whenReady(() => this.loadCursos());
    }
    this.roleContext.whenReady(() => this.loadTasks(), () => {
      this.tasksError.set('No se pudo cargar el contexto del estudiante. Recargue la página.');
    });
  }

  public loadCursos(): void {
    const params: Record<string, string> = {};
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }
    this.courseService.listar(params).subscribe({
      next: (c) =>
        this.cursos.set(
          c.map((x) => ({ id: x.id, name: x.label ?? x.name })).sort((a, b) => a.name.localeCompare(b.name)),
        ),
    });
  }

  public buscar(): void {
    this.filtroCurso.set(this.draftFiltroCurso());
    this.filtroBusqueda.set(this.draftFiltroBusqueda().trim());
    this.loadTasks();
  }

  public loadTasks(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.tasks.set([]);
      this.allRows.set([]);
      return;
    }

    const params: Record<string, string> = {};
    if (this.filtroCurso()) params['curso_id'] = this.filtroCurso();
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }
    if ((this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()) {
      params['estudiante_id'] = this.roleContext.getStudentId()!;
    }

    this.tasksLoading.set(true);
    this.tasksError.set('');
    this.taskService.listar(params).subscribe({
      next: (tasks) => {
        this.tasksLoading.set(false);
        if (this.roleContext.isStudent() || this.roleContext.isParent()) {
          this.tasks.set(tasks);
          const selected = this.selectedStudentTask();
          if (selected) {
            const updated = tasks.find((t) => t.id === selected.id);
            if (updated) this.selectedStudentTask.set(updated);
          }
          return;
        }

        const mapped = tasks.map((task) => ({
          _id: task.id,
          tarea: task.title,
          curso: task.course,
          seccion: task.section ?? '—',
          docente: task.teacher ?? '—',
          fecha: task.dueDate,
          estado: task.status,
        }));
        this.allRows.set(mapped);
      },
      error: (err) => {
        this.tasksLoading.set(false);
        this.tasksError.set(err?.error?.detail ?? 'No se pudieron cargar las tareas.');
      },
    });
  }

  public setStudentTab(tab: StudentTaskTab): void {
    this.studentTab.set(tab);
    this.cerrarDetalleTarea();
  }

  public verDetalleTarea(row: DataTableRow): void {
    const raw = row['_taskJson'];
    if (raw) {
      try {
        this.selectedStudentTask.set(JSON.parse(String(raw)) as Task);
      } catch {
        const id = row['_id'];
        const task = this.tasks().find((t) => t.id === id);
        if (task) this.selectedStudentTask.set(task);
      }
    }
    this.deliveryComment.set('');
    this.deliveryUrl.set('');
    this.selectedFile.set(null);
    this.deliveryError.set('');
    this.deliverySuccess.set('');
    this.deliverySubmitted.set(false);
  }

  public cerrarDetalleTarea(): void {
    this.selectedStudentTask.set(null);
    this.deliveryComment.set('');
    this.deliveryUrl.set('');
    this.selectedFile.set(null);
    this.deliveryError.set('');
    this.deliverySuccess.set('');
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  public enviarEntrega(): void {
    const task = this.selectedStudentTask();
    const estudianteId = this.roleContext.getStudentId();
    if (!task || !estudianteId) return;

    const url = this.deliveryUrl().trim();
    const file = this.selectedFile();
    if (!url && !file) {
      this.deliveryError.set('Debes subir un archivo o ingresar una URL de entrega.');
      return;
    }

    this.isUploading.set(true);
    this.deliveryError.set('');
    this.deliverySuccess.set('');

    const archivoUrl = url || `simulado://${file?.name ?? 'entrega'}`;

    this.taskService
      .registrarEntrega(task.id, {
        estudiante_id: estudianteId,
        descripcion: this.deliveryComment().trim() || undefined,
        archivo_url: archivoUrl,
      })
      .subscribe({
        next: () => {
          this.isUploading.set(false);
          this.deliverySubmitted.set(true);
          this.deliverySuccess.set(
            url
              ? 'Entrega registrada correctamente.'
              : 'Entrega registrada con URL simulada para fines académicos.',
          );
          this.loadTasks();
          const updated = this.tasks().find((t) => t.id === task.id);
          if (updated) this.selectedStudentTask.set(updated);
        },
        error: (err) => {
          this.isUploading.set(false);
          this.deliveryError.set(err?.error?.detail ?? 'No se pudo registrar la entrega.');
        },
      });
  }

  public verEntregas(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || !this.roleContext.isTeacher()) return;
    this.selectedTaskId.set(String(id));
    this.selectedTaskTitle.set(String(row['tarea'] ?? ''));
    this.entregaError.set('');
    this.entregaSuccess.set('');
    this.gradingEntregaId.set('');
    this.loadEntregas(String(id));
  }

  public cerrarEntregas(): void {
    this.selectedTaskId.set('');
    this.selectedTaskTitle.set('');
    this.entregas.set([]);
    this.gradingEntregaId.set('');
  }

  public loadEntregas(tareaId: string): void {
    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId) return;
    this.entregasLoading.set(true);
    this.taskService.listarEntregas(tareaId, docenteId).subscribe({
      next: (items) => {
        this.entregas.set(items);
        this.entregasLoading.set(false);
      },
      error: (err) => {
        this.entregaError.set(err?.error?.detail ?? 'No se pudieron cargar las entregas.');
        this.entregasLoading.set(false);
      },
    });
  }

  public iniciarCalificacion(row: DataTableRow): void {
    if (row['_submitted'] !== '1' || !row['_id']) {
      this.entregaError.set('Este estudiante aún no ha entregado la tarea.');
      return;
    }
    this.gradingEntregaId.set(String(row['_id']));
    this.gradingNota.set(parseFloat(String(row['nota'] ?? '0')) || 0);
    this.gradingFeedback.set(String(row['_feedback'] ?? ''));
    this.entregaError.set('');
  }

  public formatEntregaAdjunto(url: string | undefined): string {
    const value = (url ?? '').trim();
    if (!value) return '—';
    if (value.startsWith('simulado://')) {
      return value.replace('simulado://', 'Archivo: ');
    }
    return value.length > 48 ? `${value.slice(0, 45)}...` : value;
  }

  public abrirAdjuntoEntrega(url: string | undefined): void {
    const value = (url ?? '').trim();
    if (!value) {
      this.entregaError.set('Esta entrega no tiene adjunto registrado.');
      return;
    }
    if (value.startsWith('simulado://')) {
      window.alert(`Archivo entregado (académico): ${value.replace('simulado://', '')}`);
      return;
    }
    window.open(value, '_blank', 'noopener');
  }

  public verAdjuntoEntrega(row: DataTableRow): void {
    this.abrirAdjuntoEntrega(String(row['_fileUrl'] ?? ''));
  }

  public guardarCalificacionEntrega(): void {
    const entregaId = this.gradingEntregaId();
    const docenteId = this.roleContext.getTeacherId();
    if (!entregaId || !docenteId) return;
    this.entregaError.set('');
    this.taskService
      .calificarEntrega(entregaId, {
        nota: this.gradingNota(),
        retroalimentacion: this.gradingFeedback().trim() || undefined,
        estado_codigo: 'CALIFICADA',
        docente_id: docenteId,
      })
      .subscribe({
        next: () => {
          this.entregaSuccess.set('Entrega calificada correctamente.');
          this.gradingEntregaId.set('');
          this.loadEntregas(this.selectedTaskId());
        },
        error: (err) => this.entregaError.set(err?.error?.detail ?? 'No se pudo calificar la entrega.'),
      });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!this.isFormValid()) return;

    const docenteId = this.roleContext.getTeacherId();
    if (!docenteId) {
      this.errorMessage.set('Solo el docente puede crear tareas.');
      return;
    }

    this.taskService
      .crear({
        curso_asignado_id: this.cursoId(),
        docente_id: docenteId,
        titulo: this.title().trim(),
        descripcion: this.descripcion().trim() || undefined,
        fecha_entrega: this.dueDate(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Tarea publicada correctamente.');
          this.title.set('');
          this.descripcion.set('');
          this.dueDate.set('');
          this.submitted.set(false);
          this.loadTasks();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo crear la tarea.'),
      });
  }
}
