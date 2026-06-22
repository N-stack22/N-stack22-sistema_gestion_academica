import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { Course } from '../../interfaces/course';
import { CourseService } from '../../services/course.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';
import { Schedule } from '../../interfaces/schedule';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-schedules',
  imports: [RouterLink, DataTable],
  templateUrl: './schedules.html',
  styleUrl: './schedules.scss',
})
export class Schedules implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly catalogService = inject(CatalogService);
  private readonly courseService = inject(CourseService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly parentContext = inject(ParentContextService);

  protected readonly anioId = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly cursoId = signal('');
  protected readonly diaSemana = signal(1);
  protected readonly horaInicio = signal('08:00');
  protected readonly horaFin = signal('09:30');
  protected readonly aula = signal('');
  protected readonly editId = signal('');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly anios = signal<{ id: string; anio: number }[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<CatalogGrade[]>([]);
  protected readonly secciones = signal<CatalogSection[]>([]);
  protected readonly cursos = signal<Course[]>([]);
  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly horarioSemanal = signal<Schedule[]>([]);

  protected readonly draftFiltroBusqueda = signal('');
  protected readonly draftFiltroDia = signal('');
  protected readonly filtroBusqueda = signal('');
  protected readonly filtroDia = signal('');

  protected readonly editMode = computed(() => !!this.editId());

  protected readonly seccionSeleccionada = computed(
    () => this.secciones().find((s) => s.id === this.seccionId()) ?? null,
  );

  protected readonly cursoSeleccionado = computed(
    () => this.cursos().find((c) => c.id === this.cursoId()) ?? null,
  );

  protected readonly diasSemana = [
    { order: 1, nombre: 'Lunes' },
    { order: 2, nombre: 'Martes' },
    { order: 3, nombre: 'Miércoles' },
    { order: 4, nombre: 'Jueves' },
    { order: 5, nombre: 'Viernes' },
    { order: 6, nombre: 'Sábado' },
    { order: 7, nombre: 'Domingo' },
  ];

  protected readonly horarioPorDia = computed(() => {
    const map = new Map<number, Schedule[]>();
    for (const d of this.diasSemana) map.set(d.order, []);
    for (const h of this.horarioSemanal()) {
      const dia = h.dayOrder ?? 0;
      if (map.has(dia)) map.get(dia)!.push(h);
    }
    for (const [, lista] of map) {
      lista.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
    }
    return map;
  });

  protected readonly diasSemanaVisibles = computed(() => {
    const dia = Number(this.filtroDia());
    return dia ? this.diasSemana.filter((d) => d.order === dia) : this.diasSemana;
  });

  protected readonly columns: DataTableColumn[] = [
    { key: 'curso', label: 'Curso' },
    { key: 'docente', label: 'Docente' },
    { key: 'seccion', label: 'Sección' },
    { key: 'dia', label: 'Día' },
    { key: 'horario', label: 'Horario' },
    { key: 'aula', label: 'Aula' },
  ];

  protected readonly pageTitle = computed(() => {
    if (this.roleContext.isStudent()) return 'Mi Horario de Clases';
    if (this.roleContext.isParent()) return 'Horario del Estudiante';
    if (this.roleContext.isTeacher()) return 'Mi Horario Docente';
    return 'Horario Institucional';
  });

  protected readonly pageSubtitle = computed(() => {
    if (this.roleContext.isStudent()) return 'Horario semanal desde la base de datos.';
    if (this.roleContext.isParent()) return 'Horario académico del estudiante asociado.';
    if (this.roleContext.isTeacher()) return 'Clases asignadas registradas en el sistema.';
    return 'Seleccione sección y curso; cada opción muestra asignatura y docente asignado.';
  });

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.loadHorarios();
    });
  }

  ngOnInit(): void {
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.anios().subscribe({
      next: (a) => {
        const list = a as { id: string; anio: number }[];
        this.anios.set(list);
        if (list.length) this.anioId.set(list[0].id);
      },
    });
    this.roleContext.whenReady(() => this.loadHorarios());
  }

  protected onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    this.secciones.set([]);
    this.cursoId.set('');
    this.cursos.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as CatalogGrade[]),
      });
    } else {
      this.grados.set([]);
    }
    this.loadHorarios();
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    this.seccionId.set('');
    this.cursoId.set('');
    this.cursos.set([]);
    if (this.anioId() && gradoId) {
      this.catalogService.secciones(this.anioId(), gradoId).subscribe({
        next: (s) => this.secciones.set(s as CatalogSection[]),
      });
    } else {
      this.secciones.set([]);
    }
    this.loadHorarios();
  }

  protected onAnioChange(anioId: string): void {
    this.anioId.set(anioId);
    this.onGradoChange(this.gradoId());
  }

  protected onSeccionChange(seccionId: string): void {
    this.seccionId.set(seccionId);
    this.cursoId.set('');
    this.loadCursos();
    this.loadHorarios();
  }

  protected onCursoChange(cursoId: string): void {
    this.cursoId.set(cursoId);
    const curso = this.cursos().find((c) => c.id === cursoId);
    if (curso?.sectionRoom && !this.aula()) {
      this.aula.set(curso.sectionRoom);
    }
    this.loadHorarios();
  }

  protected loadCursos(): void {
    if (!this.seccionId()) {
      this.cursos.set([]);
      return;
    }
    const params: Record<string, string> = { seccion_id: this.seccionId() };
    if (this.anioId()) params['anio_id'] = this.anioId();
    this.courseService.listar(params).subscribe({
      next: (c) => this.cursos.set(c),
    });
  }

  protected loadHorarios(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.horarioSemanal.set([]);
      this.rows.set([]);
      return;
    }

    const params: Record<string, string> = {};
    if (this.anioId()) params['anio_id'] = this.anioId();
    if (this.seccionId()) params['seccion_id'] = this.seccionId();
    if (this.cursoId()) params['curso_id'] = this.cursoId();
    if (this.filtroBusqueda()) params['busqueda'] = this.filtroBusqueda();
    if (this.filtroDia()) params['dia_semana'] = this.filtroDia();
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }
    if ((this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()) {
      params['estudiante_id'] = this.roleContext.getStudentId()!;
    }
    this.scheduleService.listar(params).subscribe({
      next: (items) => {
        const showWeekly =
          this.seccionId() || this.roleContext.isTeacher() || this.roleContext.isStudent() || this.roleContext.isParent();
        this.horarioSemanal.set(showWeekly ? items : []);
        this.rows.set(
          items.map((h) => ({
            _id: h.id,
            curso: h.course ?? '—',
            docente: h.teacher ?? h.teacherName ?? '—',
            seccion: h.section ?? '—',
            dia: h.day ?? '—',
            horario: h.time ?? `${h.startTime ?? ''} - ${h.endTime ?? ''}`,
            aula: h.classroom ?? '—',
          })),
        );
      },
    });
  }

  protected buscarHorarios(): void {
    this.filtroBusqueda.set(this.draftFiltroBusqueda().trim());
    this.filtroDia.set(this.draftFiltroDia());
    this.loadHorarios();
  }

  protected guardarHorario(): void {
    if (!this.cursoId()) return;
    const payload = {
      curso_asignado_id: this.cursoId(),
      dia_semana: this.diaSemana(),
      hora_inicio: this.horaInicio(),
      hora_fin: this.horaFin(),
      aula: this.aula() || undefined,
    };
    const req = this.editId()
      ? this.scheduleService.actualizar(this.editId(), payload)
      : this.scheduleService.crear(payload);
    req.subscribe({
      next: () => {
        this.successMessage.set(
          this.editId() ? 'Horario actualizado correctamente.' : 'Horario guardado correctamente.',
        );
        this.errorMessage.set('');
        this.cancelarEdicion();
        this.loadCursos();
        this.loadHorarios();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar el horario (posible cruce).');
      },
    });
  }

  protected onEditar(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.editId.set(String(id));
    this.errorMessage.set('');
    this.successMessage.set('');
    this.scheduleService.obtener(String(id)).subscribe({
      next: (h) => {
        if (h.academicYearId) this.anioId.set(h.academicYearId);
        if (h.courseId) this.cursoId.set(h.courseId);
        if (h.dayOrder) this.diaSemana.set(h.dayOrder);
        if (h.startTime) this.horaInicio.set(h.startTime);
        if (h.endTime) this.horaFin.set(h.endTime);
        this.aula.set(h.classroom ?? '');

        const restaurarSeccion = (): void => {
          if (h.sectionId) {
            this.seccionId.set(h.sectionId);
            this.loadCursos();
          }
        };

        if (h.levelId) {
          this.nivelId.set(h.levelId);
          this.catalogService.grados(h.levelId).subscribe({
            next: (g) => {
              this.grados.set(g as CatalogGrade[]);
              if (h.gradeId && h.academicYearId) {
                this.gradoId.set(h.gradeId);
                this.catalogService.secciones(h.academicYearId, h.gradeId).subscribe({
                  next: (s) => {
                    this.secciones.set(s as CatalogSection[]);
                    restaurarSeccion();
                  },
                });
              } else {
                restaurarSeccion();
              }
            },
          });
        } else {
          restaurarSeccion();
        }
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el horario para editar.');
        this.editId.set('');
      },
    });
  }

  protected eliminarHorario(): void {
    const id = this.editId();
    if (!id) return;
    this.scheduleService.eliminar(id).subscribe({
      next: () => {
        this.successMessage.set('Horario eliminado.');
        this.errorMessage.set('');
        this.cancelarEdicion();
        this.loadCursos();
        this.loadHorarios();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo eliminar el horario.');
      },
    });
  }

  protected cancelarEdicion(): void {
    this.editId.set('');
    this.diaSemana.set(1);
    this.horaInicio.set('08:00');
    this.horaFin.set('09:30');
    this.aula.set(this.cursoSeleccionado()?.sectionRoom ?? '');
  }
}
