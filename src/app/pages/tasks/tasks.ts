import { Component, computed, inject, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { TaskService } from '../../services/task.service';
import { RoleContextService } from '../../services/role-context.service';
import { isRequired, minLength } from '../../utils/form-validation';

@Component({
  selector: 'app-tasks',
  imports: [DataTable],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks {
  private readonly taskService = inject(TaskService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly title = signal('');
  protected readonly course = signal('');
  protected readonly dueDate = signal('');
  protected readonly status = signal('');
  protected readonly submitted = signal(false);
  protected readonly successMessage = signal('');

  protected readonly titleError = computed(() => {
    if (!this.submitted() && !this.title()) return '';
    return isRequired(this.title(), 'El título es obligatorio.') || minLength(this.title(), 4, 'El título debe tener al menos 4 caracteres.');
  });

  protected readonly courseError = computed(() => {
    if (!this.submitted() && !this.course()) return '';
    return isRequired(this.course(), 'El curso es obligatorio.');
  });

  protected readonly dueDateError = computed(() => {
    if (!this.submitted() && !this.dueDate()) return '';
    return isRequired(this.dueDate(), 'La fecha de entrega es obligatoria.');
  });

  protected readonly statusError = computed(() => {
    if (!this.submitted() && !this.status()) return '';
    return isRequired(this.status(), 'El estado es obligatorio.');
  });

  protected readonly isFormValid = computed(
    () => !this.titleError() && !this.courseError() && !this.dueDateError() && !this.statusError(),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'tarea', label: 'Tarea' },
    { key: 'curso', label: 'Curso' },
    { key: 'fecha', label: 'Fecha de entrega' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly adminRows: DataTableRow[] = this.taskService.getAll().map((task) => ({
    tarea: task.title,
    curso: task.course,
    fecha: task.dueDate,
    estado: task.status,
  }));

  private readonly localRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return this.roleContext.getStudentTasks();
    }

    const base = this.roleContext.isTeacher()
      ? this.roleContext.getTeacherTasks()
      : this.adminRows;

    return [...this.localRows(), ...base];
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');

    if (!this.isFormValid()) {
      return;
    }

    const newRow: DataTableRow = {
      tarea: this.title().trim(),
      curso: this.course().trim(),
      fecha: this.dueDate(),
      estado: this.status(),
    };

    this.localRows.update((rows) => [newRow, ...rows]);
    this.successMessage.set(`Tarea "${newRow['tarea']}" registrada correctamente (simulado).`);
    this.title.set('');
    this.course.set('');
    this.dueDate.set('');
    this.status.set('');
    this.submitted.set(false);
  }
}
