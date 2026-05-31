import { Component, computed, inject, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { RoleContextService } from '../../services/role-context.service';
import { StudentService } from '../../services/student.service';
import { isRequired, minLength } from '../../utils/form-validation';

@Component({
  selector: 'app-students',
  imports: [DataTable],
  templateUrl: './students.html',
  styleUrl: './students.scss',
})
export class Students {
  private readonly studentService = inject(StudentService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly code = signal('');
  protected readonly fullName = signal('');
  protected readonly level = signal('');
  protected readonly grade = signal('');
  protected readonly section = signal('');
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

  protected readonly levelError = computed(() => {
    if (!this.submitted() && !this.level()) return '';
    return isRequired(this.level(), 'El nivel es obligatorio.');
  });

  protected readonly gradeError = computed(() => {
    if (!this.submitted() && !this.grade()) return '';
    return isRequired(this.grade(), 'El grado es obligatorio.');
  });

  protected readonly sectionError = computed(() => {
    if (!this.submitted() && !this.section()) return '';
    return isRequired(this.section(), 'La sección es obligatoria.');
  });

  protected readonly statusError = computed(() => {
    if (!this.submitted() && !this.status()) return '';
    return isRequired(this.status(), 'El estado es obligatorio.');
  });

  protected readonly isFormValid = computed(
    () =>
      !this.codeError() &&
      !this.fullNameError() &&
      !this.levelError() &&
      !this.gradeError() &&
      !this.sectionError() &&
      !this.statusError(),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'estado', label: 'Estado' },
  ];

  private readonly baseRows: DataTableRow[] = this.studentService.getAll().map((student) => ({
    codigo: student.code,
    nombre: student.fullName,
    nivel: student.level,
    grado: student.grade,
    seccion: student.section,
    estado: student.status,
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
      nivel: this.level(),
      grado: this.grade(),
      seccion: this.section(),
      estado: this.status(),
    };

    this.localRows.update((rows) => [newRow, ...rows]);
    this.successMessage.set(`Estudiante ${newRow['nombre']} registrado correctamente (simulado).`);
    this.resetForm();
  }

  private resetForm(): void {
    this.code.set('');
    this.fullName.set('');
    this.level.set('');
    this.grade.set('');
    this.section.set('');
    this.status.set('');
    this.submitted.set(false);
  }
}
