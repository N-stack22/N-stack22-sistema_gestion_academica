import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { Student } from '../../interfaces/student';
import { RoleContextService } from '../../services/role-context.service';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { ParentService } from '../../services/parent.service';
import { CatalogService } from '../../services/catalog.service';
import {
  birthDateNotFuture,
  dniEightDigits,
  emailFormatError,
  isRequired,
  phoneNineDigits,
  sanitizeDigits,
} from '../../utils/form-validation';

@Component({
  selector: 'app-students',
  imports: [DataTable, RouterLink],
  templateUrl: './students.html',
  styleUrl: './students.scss',
})
export class Students implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly parentService = inject(ParentService);
  private readonly courseService = inject(CourseService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');
  protected readonly dni = signal('');
  protected readonly phone = signal('');
  protected readonly birthDate = signal('');
  protected readonly notes = signal('');
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly loading = signal(false);
  protected readonly draftSearchFilter = signal('');
  protected readonly draftCourseId = signal('');
  protected readonly searchFilter = signal('');
  protected readonly selectedCourseId = signal('');

  protected readonly teacherCursos = signal<{ id: string; name: string }[]>([]);

  protected readonly selectedStudent = signal<Student | null>(null);
  protected readonly editMode = signal(false);

  protected readonly apoderados = signal<{ id: string; fullName: string }[]>([]);
  protected readonly apoderadoId = signal('');
  protected readonly parentesco = signal('Padre');
  protected readonly esPrincipal = signal(false);
  protected readonly linkSuccess = signal('');

  protected readonly maxBirthDate = new Date().toISOString().slice(0, 10);

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'anio', label: 'Año' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly allRows = signal<DataTableRow[]>([]);

  protected readonly rows = computed(() => {
    const q = this.searchFilter().trim().toLowerCase();
    if (!q) return this.allRows();
    return this.allRows().filter((r) => {
      const nombre = String(r['nombre'] ?? '').toLowerCase();
      const codigo = String(r['codigo'] ?? '').toLowerCase();
      return nombre.includes(q) || codigo.includes(q);
    });
  });

  protected readonly isFormValid = computed(
    () =>
      !this.firstNameError() &&
      !this.lastNameError() &&
      !this.emailError() &&
      !this.dniError() &&
      !this.phoneError() &&
      !this.birthDateError(),
  );

  protected readonly firstNameError = computed(() =>
    this.submitted() || this.firstName() ? isRequired(this.firstName(), 'Nombres obligatorios.') : '',
  );
  protected readonly lastNameError = computed(() =>
    this.submitted() || this.lastName() ? isRequired(this.lastName(), 'Apellidos obligatorios.') : '',
  );
  protected readonly emailError = computed(() => {
    if (!this.submitted() && !this.email()) return '';
    const required = isRequired(this.email(), 'Correo obligatorio.');
    return required || emailFormatError(this.email());
  });
  protected readonly dniError = computed(() => {
    if (!this.submitted() && !this.dni()) return '';
    return dniEightDigits(this.dni());
  });
  protected readonly phoneError = computed(() => {
    if (!this.submitted() && !this.phone()) return '';
    return phoneNineDigits(this.phone());
  });
  protected readonly birthDateError = computed(() => {
    if (!this.submitted() && !this.birthDate()) return '';
    return birthDateNotFuture(this.birthDate());
  });

  ngOnInit(): void {
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      this.courseService.listar({ docente_id: this.roleContext.getTeacherId()! }).subscribe({
        next: (c) =>
          this.teacherCursos.set(c.map((x) => ({ id: x.id, name: x.label ?? x.name }))),
      });
    }
    this.loadStudents();
    if (!this.roleContext.isTeacher()) {
    this.parentService.listar().subscribe({
      next: (parents) => {
        const unique = new Map<string, string>();
        parents.forEach((p) => {
          if (p.id && !unique.has(p.id)) unique.set(p.id, p.fullName);
        });
        this.apoderados.set([...unique.entries()].map(([id, fullName]) => ({ id, fullName })));
      },
    });
    }
  }

  protected buscar(): void {
    this.searchFilter.set(this.draftSearchFilter().trim());
    this.selectedCourseId.set(this.draftCourseId());
    this.loadStudents();
  }

  protected onDniInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dni.set(sanitizeDigits(value, 8));
  }

  protected onPhoneInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.phone.set(sanitizeDigits(value, 9));
  }

  protected loadStudents(): void {
    this.loading.set(true);
    const params: Record<string, string> = {};
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
      if (this.selectedCourseId()) params['curso_id'] = this.selectedCourseId()!;
    }
    this.studentService
      .listar(Object.keys(params).length ? params : undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (students) => {
          this.allRows.set(
            students.map((s) => ({
              _id: s.id,
              codigo: s.code,
              nombre: s.fullName,
              nivel: s.level,
              grado: s.grade,
              seccion: s.section,
              anio: s.academicYear ?? '—',
              estado: s.status,
            })),
          );
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar el listado de estudiantes.');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    if (!this.isFormValid() || this.saving()) return;

    const payload = {
      nombres: this.firstName().trim(),
      apellidos: this.lastName().trim(),
      correo_institucional: this.email().trim(),
      dni: this.dni().trim() || undefined,
      telefono: this.phone().trim() || undefined,
      fecha_nacimiento: this.birthDate() || undefined,
      observaciones: this.notes().trim() || undefined,
    };

    const request =
      this.editMode() && this.selectedStudent()
        ? this.studentService.actualizar(this.selectedStudent()!.id, {
            nombres: payload.nombres,
            apellidos: payload.apellidos,
            correo_institucional: payload.correo_institucional,
            dni: payload.dni,
            telefono: payload.telefono,
            fecha_nacimiento: payload.fecha_nacimiento,
            observaciones: payload.observaciones,
          })
        : this.studentService.crear(payload);

    this.saving.set(true);
    request
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (student) => {
          this.successMessage.set(
            this.editMode()
              ? `Estudiante ${student.fullName} actualizado.`
              : `Estudiante ${student.fullName} registrado. Código: ${student.code}`,
          );
          this.resetForm();
          this.catalogService.invalidate();
          this.loadStudents();
        },
        error: (err) => {
          const detail = err?.error?.detail;
          if (err?.name === 'TimeoutError') {
            this.errorMessage.set(
              'La operación tardó demasiado. Verifique que el backend esté activo y que Backend/.env use la service_role key de Supabase.',
            );
          } else {
            this.errorMessage.set(
              detail ??
                'Error al guardar el estudiante. Si es registro nuevo, confirme la service_role key en Backend/.env.',
            );
          }
        },
      });
  }

  protected onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.studentService.obtener(id).subscribe({
      next: (student) => {
        this.selectedStudent.set(student);
        this.editMode.set(true);
        this.firstName.set(student.firstName ?? student.fullName.split(' ')[0] ?? '');
        this.lastName.set(student.lastName ?? student.fullName.split(' ').slice(1).join(' ') ?? '');
        this.email.set(student.email ?? '');
        this.dni.set(student.dni ?? '');
        this.phone.set(student.phone ?? '');
        this.birthDate.set(student.birthDate ?? '');
        this.notes.set(student.notes ?? '');
        this.submitted.set(false);
        this.errorMessage.set('');
      },
    });
  }

  protected matricular(): void {
    const student = this.selectedStudent();
    if (!student) return;
    void this.router.navigate(['/admin/matriculas'], {
      queryParams: { estudianteId: student.id },
    });
  }

  protected asociarApoderado(): void {
    const student = this.selectedStudent();
    if (!student || !this.apoderadoId()) return;
    this.parentService
      .vincular(this.apoderadoId(), {
        estudiante_id: student.id,
        parentesco: this.parentesco(),
        es_principal: this.esPrincipal(),
      })
      .subscribe({
        next: () => {
          this.linkSuccess.set('Apoderado asociado correctamente.');
          this.catalogService.invalidate();
          this.studentService.obtener(student.id).subscribe({
            next: (updated) => this.selectedStudent.set(updated),
          });
        },
      });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.email.set('');
    this.dni.set('');
    this.phone.set('');
    this.birthDate.set('');
    this.notes.set('');
    this.submitted.set(false);
    this.editMode.set(false);
    this.selectedStudent.set(null);
  }
}
