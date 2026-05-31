import { Component, computed, inject, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { RoleContextService } from '../../services/role-context.service';
import { CourseService } from '../../services/course.service';
import { isRequired } from '../../utils/form-validation';

@Component({
  selector: 'app-courses',
  imports: [DataTable],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})
export class Courses {
  private readonly courseService = inject(CourseService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly code = signal('');
  protected readonly courseName = signal('');
  protected readonly level = signal('');
  protected readonly grade = signal('');
  protected readonly teacherName = signal('');
  protected readonly status = signal('');
  protected readonly submitted = signal(false);
  protected readonly successMessage = signal('');

  protected readonly codeError = computed(() => {
    if (!this.submitted() && !this.code()) return '';
    return isRequired(this.code(), 'El código es obligatorio.');
  });

  protected readonly courseNameError = computed(() => {
    if (!this.submitted() && !this.courseName()) return '';
    return isRequired(this.courseName(), 'El nombre del curso es obligatorio.');
  });

  protected readonly levelError = computed(() => {
    if (!this.submitted() && !this.level()) return '';
    return isRequired(this.level(), 'El nivel es obligatorio.');
  });

  protected readonly gradeError = computed(() => {
    if (!this.submitted() && !this.grade()) return '';
    return isRequired(this.grade(), 'El grado es obligatorio.');
  });

  protected readonly teacherNameError = computed(() => {
    if (!this.submitted() && !this.teacherName()) return '';
    return isRequired(this.teacherName(), 'El docente es obligatorio.');
  });

  protected readonly statusError = computed(() => {
    if (!this.submitted() && !this.status()) return '';
    return isRequired(this.status(), 'El estado es obligatorio.');
  });

  protected readonly isFormValid = computed(
    () =>
      !this.codeError() &&
      !this.courseNameError() &&
      !this.levelError() &&
      !this.gradeError() &&
      !this.teacherNameError() &&
      !this.statusError(),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'curso', label: 'Curso' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'docente', label: 'Docente' },
    { key: 'estado', label: 'Estado' },
  ];

  private readonly baseRows: DataTableRow[] = this.courseService.getAll().map((course) => ({
    codigo: course.code,
    curso: course.name,
    nivel: course.level,
    grado: course.grade,
    docente: course.teacherName,
    estado: course.status,
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
      curso: this.courseName().trim(),
      nivel: this.level(),
      grado: this.grade().trim(),
      docente: this.teacherName().trim(),
      estado: this.status(),
    };

    this.localRows.update((rows) => [newRow, ...rows]);
    this.successMessage.set(`Curso ${newRow['curso']} registrado correctamente (simulado).`);
    this.code.set('');
    this.courseName.set('');
    this.level.set('');
    this.grade.set('');
    this.teacherName.set('');
    this.status.set('');
    this.submitted.set(false);
  }
}
