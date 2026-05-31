import { Component, computed, inject, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { ResourceService } from '../../services/resource.service';
import { RoleContextService } from '../../services/role-context.service';
import { isRequired, minLength } from '../../utils/form-validation';

@Component({
  selector: 'app-resources',
  imports: [DataTable],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources {
  private readonly resourceService = inject(ResourceService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly title = signal('');
  protected readonly course = signal('');
  protected readonly type = signal('');
  protected readonly date = signal('');
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

  protected readonly typeError = computed(() => {
    if (!this.submitted() && !this.type()) return '';
    return isRequired(this.type(), 'El tipo es obligatorio.');
  });

  protected readonly dateError = computed(() => {
    if (!this.submitted() && !this.date()) return '';
    return isRequired(this.date(), 'La fecha es obligatoria.');
  });

  protected readonly statusError = computed(() => {
    if (!this.submitted() && !this.status()) return '';
    return isRequired(this.status(), 'El estado es obligatorio.');
  });

  protected readonly isFormValid = computed(
    () =>
      !this.titleError() &&
      !this.courseError() &&
      !this.typeError() &&
      !this.dateError() &&
      !this.statusError(),
  );

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'recurso', label: 'Recurso' },
    { key: 'curso', label: 'Curso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly personalColumns: DataTableColumn[] = [
    { key: 'recurso', label: 'Recurso' },
    { key: 'curso', label: 'Curso' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly columns = computed(() =>
    this.roleContext.isStudent() || this.roleContext.isParent() || this.roleContext.isTeacher()
      ? this.personalColumns
      : this.adminColumns,
  );

  protected readonly adminRows: DataTableRow[] = this.resourceService.getAll().map((r) => ({
    recurso: r.title,
    curso: r.course,
    tipo: r.type,
    fecha: r.date,
    estado: r.status,
  }));

  private readonly localRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return this.roleContext.getStudentResources();
    }

    const base = this.roleContext.isTeacher()
      ? this.roleContext.getTeacherResources()
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
      recurso: this.title().trim(),
      curso: this.course().trim(),
      tipo: this.type(),
      fecha: this.date(),
      estado: this.status(),
    };

    this.localRows.update((rows) => [newRow, ...rows]);
    this.successMessage.set(`Recurso "${newRow['recurso']}" registrado correctamente (simulado).`);
    this.title.set('');
    this.course.set('');
    this.type.set('');
    this.date.set('');
    this.status.set('');
    this.submitted.set(false);
  }
}
