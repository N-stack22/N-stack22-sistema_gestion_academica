import { Component, computed, inject, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { RoleContextService } from '../../services/role-context.service';
import { TeacherService } from '../../services/teacher.service';
import { isRequired, isValidEmail, minLength } from '../../utils/form-validation';

@Component({
  selector: 'app-teachers',
  imports: [DataTable],
  templateUrl: './teachers.html',
  styleUrl: './teachers.scss',
})
export class Teachers {
  private readonly teacherService = inject(TeacherService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly code = signal('');
  protected readonly fullName = signal('');
  protected readonly specialty = signal('');
  protected readonly email = signal('');
  protected readonly status = signal('');
  protected readonly submitted = signal(false);
  protected readonly successMessage = signal('');

  protected readonly codeError = computed(() => {
    if (!this.submitted() && !this.code()) return '';
    return isRequired(this.code(), 'El código es obligatorio.');
  });

  protected readonly fullNameError = computed(() => {
    if (!this.submitted() && !this.fullName()) return '';
    return isRequired(this.fullName(), 'El nombre es obligatorio.') || minLength(this.fullName(), 3);
  });

  protected readonly specialtyError = computed(() => {
    if (!this.submitted() && !this.specialty()) return '';
    return isRequired(this.specialty(), 'La especialidad es obligatoria.');
  });

  protected readonly emailError = computed(() => {
    if (!this.submitted() && !this.email()) return '';
    const required = isRequired(this.email(), 'El correo es obligatorio.');
    if (required) return required;
    return isValidEmail(this.email()) ? '' : 'Ingresa un correo válido.';
  });

  protected readonly statusError = computed(() => {
    if (!this.submitted() && !this.status()) return '';
    return isRequired(this.status(), 'El estado es obligatorio.');
  });

  protected readonly isFormValid = computed(
    () =>
      !this.codeError() &&
      !this.fullNameError() &&
      !this.specialtyError() &&
      !this.emailError() &&
      !this.statusError(),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'correo', label: 'Correo' },
    { key: 'estado', label: 'Estado' },
  ];

  private readonly baseRows: DataTableRow[] = this.teacherService.getAll().map((teacher) => ({
    codigo: teacher.code,
    nombre: teacher.fullName,
    especialidad: teacher.specialty,
    correo: teacher.email,
    estado: teacher.status,
  }));

  private readonly localRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => [...this.localRows(), ...this.baseRows]);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');

    if (!this.isFormValid()) {
      return;
    }

    const newRow: DataTableRow = {
      codigo: this.code().trim(),
      nombre: this.fullName().trim(),
      especialidad: this.specialty().trim(),
      correo: this.email().trim(),
      estado: this.status(),
    };

    this.localRows.update((rows) => [newRow, ...rows]);
    this.successMessage.set(`Docente ${newRow['nombre']} registrado correctamente (simulado).`);
    this.code.set('');
    this.fullName.set('');
    this.specialty.set('');
    this.email.set('');
    this.status.set('');
    this.submitted.set(false);
  }
}
