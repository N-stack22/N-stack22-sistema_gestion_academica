import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { Student } from '../../interfaces/student';
import { RoleContextService } from '../../services/role-context.service';
import { StudentService } from '../../services/student.service';
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
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);
  public readonly roleContext = inject(RoleContextService);

  public readonly firstName = signal('');
  public readonly lastName = signal('');
  public readonly email = signal('');
  public readonly dni = signal('');
  public readonly phone = signal('');
  public readonly birthDate = signal('');
  public readonly notes = signal('');
  public readonly submitted = signal(false);
  public readonly saving = signal(false);
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');
  public readonly loading = signal(false);

  public readonly selectedStudent = signal<Student | null>(null);
  public readonly editMode = signal(false);

  public readonly apoderados = signal<{ id: string; fullName: string }[]>([]);
  public readonly apoderadoId = signal('');
  public readonly parentesco = signal('Padre');
  public readonly esPrincipal = signal(false);
  public readonly linkSuccess = signal('');

  public readonly maxBirthDate = new Date().toISOString().slice(0, 10);

  public readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'anio', label: 'Año' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly allRows = signal<DataTableRow[]>([]);

  public readonly rows = computed(() => this.allRows());

  public readonly isFormValid = computed(
    () =>
      !this.firstNameError() &&
      !this.lastNameError() &&
      !this.emailError() &&
      !this.dniError() &&
      !this.phoneError() &&
      !this.birthDateError(),
  );

  public readonly firstNameError = computed(() =>
    this.submitted() || this.firstName() ? isRequired(this.firstName(), 'Nombres obligatorios.') : '',
  );
  public readonly lastNameError = computed(() =>
    this.submitted() || this.lastName() ? isRequired(this.lastName(), 'Apellidos obligatorios.') : '',
  );
  public readonly emailError = computed(() => {
    if (!this.submitted() && !this.email()) return '';
    const required = isRequired(this.email(), 'Correo obligatorio.');
    return required || emailFormatError(this.email());
  });
  public readonly dniError = computed(() => {
    if (!this.submitted() && !this.dni()) return '';
    return dniEightDigits(this.dni());
  });
  public readonly phoneError = computed(() => {
    if (!this.submitted() && !this.phone()) return '';
    return phoneNineDigits(this.phone());
  });
  public readonly birthDateError = computed(() => {
    if (!this.submitted() && !this.birthDate()) return '';
    return birthDateNotFuture(this.birthDate());
  });

  ngOnInit(): void {
    this.roleContext.whenReady(() => this.loadStudents());
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

  public onDniInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dni.set(sanitizeDigits(value, 8));
  }

  public onPhoneInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.phone.set(sanitizeDigits(value, 9));
  }

  public loadStudents(): void {
    this.loading.set(true);
    const params: Record<string, string> = {};
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
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

  public onSubmit(event: Event): void {
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

  public onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    if (this.roleContext.isTeacher()) {
      void this.router.navigate(['/admin/seguimiento-padres'], {
        queryParams: { estudianteId: id },
      });
      return;
    }
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

  public matricular(): void {
    const student = this.selectedStudent();
    if (!student) return;
    void this.router.navigate(['/admin/matriculas'], {
      queryParams: { estudianteId: student.id },
    });
  }

  public asociarApoderado(): void {
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

  public cancelEdit(): void {
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
