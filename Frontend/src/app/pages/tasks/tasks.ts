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
  protected readonly roleContext = inject(RoleContextService);
  private readonly parentContext = inject(ParentContextService);

  protected readonly title = signal('');
  protected readonly descripcion = signal('');
  protected readonly cursoId = signal('');
  protected readonly dueDate = signal('');
  protected readonly submitted = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly filtroCurso = signal('');
  protected readonly cursos = signal<{ id: string; name: string }[]>([]);

  protected readonly selectedTaskId = signal('');
  protected readonly selectedTaskTitle = signal('');
  protected readonly entregas = signal<TaskSubmission[]>([]);
  protected readonly entregasLoading = signal(false);
  protected readonly entregaError = signal('');
  protected readonly entregaSuccess = signal('');
  protected readonly gradingEntregaId = signal('');
  protected readonly gradingNota = signal(0);
  protected readonly gradingFeedback = signal('');

  protected readonly gradingEntrega = computed(() => {
    const id = this.gradingEntregaId();
    if (!id) return null;
    return this.entregas().find((e) => e.id === id) ?? null;
  });

  protected readonly studentTab = signal<StudentTaskTab>('pendientes');
  protected readonly tasks = signal<Task[]>([]);
  protected readonly selectedStudentTask = signal<Task | null>(null);
  protected readonly deliveryComment = signal('');
  protected readonly deliveryUrl = signal('');
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isUploading = signal(false);
  protected readonly deliverySubmitted = signal(false);
  protected readonly deliveryError = signal('');
  protected readonly deliverySuccess = signal('');

  protected readonly tasksLoading = signal(false);
  protected readonly tasksError = signal('');

  protected readonly titleError = computed(() => {
    if (!this.submitted() && !this.title()) return '';
    return isRequired(this.title(), 'El título es obligatorio.') || minLength(this.title(), 4, 'Mínimo 4 caracteres.');
  });

  protected readonly courseError = computed(() => {
    if (!this.submitted() && !this.cursoId()) return '';
    return isRequired(this.cursoId(), 'Seleccione un curso.');
  });

  protected readonly dueDateError = computed(() => {
    if (!this.submitted() && !this.dueDate()) return '';
    return isRequired(this.dueDate(), 'La fecha de entrega es obligatoria.');
  });

  protected readonly isFormValid = computed(
    () => !this.titleError() && !this.courseError() && !this.dueDateError(),
  );

  protected readonly showEntregas = computed(() => !!this.selectedTaskId() && this.roleContext.isTeacher());

  protected readonly canSubmitDelivery = computed(() => {
    const task = this.selectedStudentTask();
    if (!task || task.deliveryStatusCode === 'CALIFICADA' || task.statusCode === 'CERRADA') return false;
    return !!(this.deliveryUrl().trim() || this.selectedFile());
  });

  protected readonly pendingTasks = computed(() =>
    this.tasks().filter((t) => !t.submitted && !t.overdue),
  );
  protected readonly deliveredTasks = computed(() =>
    this.tasks().filter((t) => t.submitted && t.deliveryStatusCode !== 'CALIFICADA'),
  );
  protected readonly gradedTasks = computed(() =>
    this.tasks().filter((t) => t.deliveryStatusCode === 'CALIFICADA'),
  );
  protected readonly overdueTasks = computed(() =>
    this.tasks().filter((t) => t.overdue && !t.submitted),
  );

  protected readonly studentTabTasks = computed(() => {
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

  protected readonly entregaColumns: DataTableColumn[] = [
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'codigo', label: 'Código' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha entrega' },
    { key: 'adjunto', label: 'Adjunto' },
    { key: 'nota', label: 'Nota' },
  ];

  protected readonly studentColumns: DataTableColumn[] = [
    { key: 'tarea', label: 'Tarea' },
    { key: 'curso', label: 'Curso' },
    { key: 'docente', label: 'Docente' },
    { key: 'fecha', label: 'Fecha entrega' },
    { key: 'estado', label: 'Estado' },
    { key: 'nota', label: 'Nota' },
  ];

  protected readonly entregaRows = computed<DataTableRow[]>(() =>
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

  protected readonly columns: DataTableColumn[] = [
    { key: 'tarea', label: 'Tarea' },
    { key: 'curso', label: 'Curso' },
    { key: 'seccion', label: 'Sección' },
    { key: 'docente', label: 'Docente' },
    { key: 'fecha', label: 'Fecha de entrega' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly studentRows = computed<DataTableRow[]>(() =>
    this.studentTabTasks().map((task) => ({
      _id: task.id,
      tarea: task.title,
      curso: task.course,
      docente: task.teacher ?? '—',
      fecha: task.dueDate,
      estado: task.deliveryStatus ?? (task.submitted ? 'Entregada' : task.overdue ? 'Vencida' : 'Pendiente'),
      nota: task.deliveryGrade || '—',
      _taskJson: JSON.stringify(task),
    })),
  );

  protected readonly allRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => this.allRows());

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

  protected loadCursos(): void {
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

  protected loadTasks(): void {
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

  protected setStudentTab(tab: StudentTaskTab): void {
    this.studentTab.set(tab);
    this.cerrarDetalleTarea();
  }

  protected verDetalleTarea(row: DataTableRow): void {
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

  protected cerrarDetalleTarea(): void {
    this.selectedStudentTask.set(null);
    this.deliveryComment.set('');
    this.deliveryUrl.set('');
    this.selectedFile.set(null);
    this.deliveryError.set('');
    this.deliverySuccess.set('');
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  protected enviarEntrega(): void {
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

  protected verEntregas(row: DataTableRow): void {
    const id = row['_id'];
    if (!id || !this.roleContext.isTeacher()) return;
    this.selectedTaskId.set(String(id));
    this.selectedTaskTitle.set(String(row['tarea'] ?? ''));
    this.entregaError.set('');
    this.entregaSuccess.set('');
    this.gradingEntregaId.set('');
    this.loadEntregas(String(id));
  }

  protected cerrarEntregas(): void {
    this.selectedTaskId.set('');
    this.selectedTaskTitle.set('');
    this.entregas.set([]);
    this.gradingEntregaId.set('');
  }

  protected loadEntregas(tareaId: string): void {
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

  protected iniciarCalificacion(row: DataTableRow): void {
    if (row['_submitted'] !== '1' || !row['_id']) {
      this.entregaError.set('Este estudiante aún no ha entregado la tarea.');
      return;
    }
    this.gradingEntregaId.set(String(row['_id']));
    this.gradingNota.set(parseFloat(String(row['nota'] ?? '0')) || 0);
    this.gradingFeedback.set(String(row['_feedback'] ?? ''));
    this.entregaError.set('');
  }

  protected formatEntregaAdjunto(url: string | undefined): string {
    const value = (url ?? '').trim();
    if (!value) return '—';
    if (value.startsWith('simulado://')) {
      return value.replace('simulado://', 'Archivo: ');
    }
    return value.length > 48 ? `${value.slice(0, 45)}...` : value;
  }

  protected abrirAdjuntoEntrega(url: string | undefined): void {
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

  protected verAdjuntoEntrega(row: DataTableRow): void {
    this.abrirAdjuntoEntrega(String(row['_fileUrl'] ?? ''));
  }

  protected guardarCalificacionEntrega(): void {
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

  protected onSubmit(event: Event): void {
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
