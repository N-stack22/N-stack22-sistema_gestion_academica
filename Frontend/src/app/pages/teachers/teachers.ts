import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { RoleContextService } from '../../services/role-context.service';
import { TeacherService } from '../../services/teacher.service';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { CourseService } from '../../services/course.service';
import { ScheduleService } from '../../services/schedule.service';
import { Teacher, TeacherCourse } from '../../interfaces/teacher';
import { Schedule } from '../../interfaces/schedule';
import { isRequired, emailFormatError } from '../../utils/form-validation';

@Component({
  selector: 'app-teachers',
  imports: [DataTable],
  templateUrl: './teachers.html',
  styleUrl: './teachers.scss',
})
export class Teachers implements OnInit {
  private readonly teacherService = inject(TeacherService);
  private readonly catalogService = inject(CatalogService);
  private readonly courseService = inject(CourseService);
  private readonly scheduleService = inject(ScheduleService);
  public readonly roleContext = inject(RoleContextService);

  public readonly firstName = signal('');
  public readonly lastName = signal('');
  public readonly specialty = signal('');
  public readonly cargo = signal('');
  public readonly email = signal('');
  public readonly submitted = signal(false);
  public readonly saving = signal(false);
  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');
  public readonly selectedTeacher = signal<Teacher | null>(null);
  public readonly editMode = signal(false);
  public readonly assignedCourses = signal<TeacherCourse[]>([]);
  public readonly horarioDocente = signal<Schedule[]>([]);
  public readonly horarioDocenteDiaFiltro = signal('');

  public readonly diasSemana = [
    { order: 1, nombre: 'Lunes' },
    { order: 2, nombre: 'Martes' },
    { order: 3, nombre: 'Miércoles' },
    { order: 4, nombre: 'Jueves' },
    { order: 5, nombre: 'Viernes' },
    { order: 6, nombre: 'Sábado' },
    { order: 7, nombre: 'Domingo' },
  ];

  public readonly horarioPorDia = computed(() => {
    const map = new Map<number, Schedule[]>();
    for (const d of this.diasSemana) {
      map.set(d.order, []);
    }
    for (const h of this.horarioDocente()) {
      const dia = h.dayOrder ?? 0;
      if (map.has(dia)) {
        map.get(dia)!.push(h);
      }
    }
    for (const [, lista] of map) {
      lista.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
    }
    return map;
  });

  public readonly diasHorarioDocenteVisibles = computed(() => {
    const dia = Number(this.horarioDocenteDiaFiltro());
    return dia ? this.diasSemana.filter((d) => d.order === dia) : this.diasSemana;
  });

  public readonly draftSearchFilter = signal('');
  public readonly draftEstadoFilter = signal('');
  public readonly draftEspecialidadFilter = signal('');
  public readonly searchFilter = signal('');
  public readonly estadoFilter = signal('');
  public readonly especialidadFilter = signal('');

  public readonly asignaturaId = signal('');
  public readonly anioId = signal('');
  public readonly nivelId = signal('');
  public readonly gradoId = signal('');
  public readonly seccionId = signal('');
  public readonly asignaturas = signal<{ id: string; nombre: string }[]>([]);
  public readonly anios = signal<{ id: string; anio: number }[]>([]);
  public readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  public readonly grados = signal<CatalogGrade[]>([]);
  public readonly secciones = signal<CatalogSection[]>([]);

  public readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'correo', label: 'Correo' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly allRows = signal<DataTableRow[]>([]);

  public readonly rows = computed(() => {
    let data = this.allRows();
    const q = this.searchFilter().trim().toLowerCase();
    if (q) {
      data = data.filter(
        (r) =>
          String(r['nombre']).toLowerCase().includes(q) ||
          String(r['codigo']).toLowerCase().includes(q) ||
          String(r['correo']).toLowerCase().includes(q),
      );
    }
    if (this.estadoFilter()) {
      data = data.filter((r) => String(r['estado']).toLowerCase().includes(this.estadoFilter().toLowerCase()));
    }
    if (this.especialidadFilter()) {
      data = data.filter((r) =>
        String(r['especialidad']).toLowerCase().includes(this.especialidadFilter().toLowerCase()),
      );
    }
    return data;
  });

  public readonly isFormValid = computed(
    () => !this.firstNameError() && !this.lastNameError() && !this.emailError() && !this.specialtyError(),
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
  public readonly specialtyError = computed(() =>
    this.submitted() || this.specialty() ? isRequired(this.specialty(), 'Especialidad obligatoria.') : '',
  );

  ngOnInit(): void {
    this.loadTeachers();
    this.catalogService.asignaturas().subscribe({
      next: (items) => this.asignaturas.set(items as { id: string; nombre: string }[]),
    });
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.anios().subscribe({
      next: (items) => {
        const list = items as { id: string; anio: number }[];
        this.anios.set(list);
        if (list.length) this.anioId.set(list[0].id);
      },
    });
  }

  public buscar(): void {
    this.searchFilter.set(this.draftSearchFilter().trim());
    this.estadoFilter.set(this.draftEstadoFilter());
    this.especialidadFilter.set(this.draftEspecialidadFilter().trim());
  }

  public loadTeachers(): void {
    this.teacherService.listar().subscribe({
      next: (teachers) =>
        this.allRows.set(
          teachers.map((t) => ({
            _id: t.id,
            codigo: t.code,
            nombre: t.fullName,
            especialidad: t.specialty,
            correo: t.email,
            estado: t.status,
          })),
        ),
    });
  }

  public onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    this.secciones.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as CatalogGrade[]),
      });
    }
  }

  public onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    this.seccionId.set('');
    if (this.anioId() && gradoId) {
      this.catalogService.secciones(this.anioId(), gradoId).subscribe({
        next: (s) => this.secciones.set(s as CatalogSection[]),
      });
    }
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
      especialidad: this.specialty().trim(),
      cargo: this.cargo().trim() || undefined,
    };

    const req =
      this.editMode() && this.selectedTeacher()
        ? this.teacherService.actualizar(this.selectedTeacher()!.id, payload)
        : this.teacherService.crear(payload);

    this.saving.set(true);
    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (teacher) => {
        this.successMessage.set(`Docente ${teacher.fullName} guardado. Código: ${teacher.code}`);
        if (this.editMode()) {
          this.refreshDetail(teacher.id);
        } else {
          this.resetForm();
        }
        this.catalogService.invalidate();
        this.loadTeachers();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'Error al guardar docente.'),
    });
  }

  public asignarCurso(): void {
    const teacher = this.selectedTeacher();
    if (!teacher || !this.asignaturaId() || !this.anioId() || !this.seccionId()) {
      this.errorMessage.set('Seleccione asignatura, año, nivel, grado y sección.');
      return;
    }
    this.saving.set(true);
    this.courseService
      .crear({
        anio_academico_id: this.anioId(),
        seccion_id: this.seccionId(),
        asignatura_id: this.asignaturaId(),
        docente_id: teacher.id,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Curso asignado al docente correctamente.');
          this.errorMessage.set('');
          this.catalogService.invalidate();
          this.refreshDetail(teacher.id);
          this.loadTeachers();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'Error al asignar curso.'),
      });
  }

  public desasignarCurso(cursoId: string): void {
    const teacher = this.selectedTeacher();
    if (!teacher) return;
    this.courseService.eliminar(cursoId).subscribe({
      next: () => {
        this.successMessage.set('Curso desasignado.');
        this.catalogService.invalidate();
        this.refreshDetail(teacher.id);
        this.loadTeachers();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo desasignar el curso.'),
    });
  }

  public toggleEstado(): void {
    const teacher = this.selectedTeacher();
    if (!teacher) return;
    this.teacherService.actualizar(teacher.id, { estado: !teacher.active }).subscribe({
      next: (updated) => {
        this.selectedTeacher.set(updated);
        this.successMessage.set(`Estado actualizado: ${updated.status}`);
        this.catalogService.invalidate();
        this.loadTeachers();
      },
    });
  }

  public onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.refreshDetail(String(id));
    this.editMode.set(true);
    this.submitted.set(false);
    this.errorMessage.set('');
  }

  public cancelEdit(): void {
    this.resetForm();
  }

  private refreshDetail(id: string): void {
    this.teacherService.obtener(id).subscribe({
      next: (teacher) => {
        this.selectedTeacher.set(teacher);
        this.assignedCourses.set(teacher.assignedCourses ?? []);
        this.firstName.set(teacher.firstName ?? teacher.fullName.split(' ')[0] ?? '');
        this.lastName.set(teacher.lastName ?? teacher.fullName.split(' ').slice(1).join(' ') ?? '');
        this.email.set(teacher.email);
        this.specialty.set(teacher.specialty);
        this.cargo.set(teacher.cargo ?? '');
        this.loadHorarioDocente(id);
      },
    });
  }

  public loadHorarioDocente(docenteId: string): void {
    const params: Record<string, string> = { docente_id: docenteId };
    if (this.anioId()) params['anio_id'] = this.anioId();
    this.scheduleService.listar(params).subscribe({
      next: (items) => this.horarioDocente.set(items),
    });
  }

  private resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.specialty.set('');
    this.cargo.set('');
    this.email.set('');
    this.submitted.set(false);
    this.editMode.set(false);
    this.selectedTeacher.set(null);
    this.assignedCourses.set([]);
    this.horarioDocente.set([]);
    this.nivelId.set('');
    this.gradoId.set('');
    this.seccionId.set('');
    this.secciones.set([]);
  }
}
