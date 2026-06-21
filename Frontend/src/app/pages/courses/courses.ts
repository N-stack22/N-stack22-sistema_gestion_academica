import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { RoleContextService } from '../../services/role-context.service';
import { CourseService } from '../../services/course.service';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { TeacherContextService } from '../../services/teacher-context.service';

@Component({
  selector: 'app-courses',
  imports: [DataTable],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})
export class Courses implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly catalogService = inject(CatalogService);
  protected readonly roleContext = inject(RoleContextService);
  private readonly teacherContext = inject(TeacherContextService);

  protected readonly draftSearchTerm = signal('');
  protected readonly searchTerm = signal('');

  protected readonly asignaturaId = signal('');
  protected readonly nuevaAsignatura = signal('');
  protected readonly anioId = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly docenteId = signal('');
  protected readonly filtroAnio = signal('');
  protected readonly filtroNivel = signal('');
  protected readonly filtroGrado = signal('');
  protected readonly filtroSeccion = signal('');
  protected readonly draftFiltroAnio = signal('');
  protected readonly draftFiltroNivel = signal('');
  protected readonly draftFiltroGrado = signal('');
  protected readonly draftFiltroSeccion = signal('');
  protected readonly asignaturas = signal<{ id: string; nombre: string }[]>([]);
  protected readonly anios = signal<{ id: string; anio: number }[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<CatalogGrade[]>([]);
  protected readonly gradosFiltro = signal<CatalogGrade[]>([]);
  protected readonly secciones = signal<CatalogSection[]>([]);
  protected readonly seccionesFiltro = signal<CatalogSection[]>([]);
  protected readonly docentes = signal<{ id: string; fullName: string }[]>([]);
  protected readonly successMessage = signal('');

  protected readonly columns: DataTableColumn[] = [
    { key: 'curso', label: 'Asignatura' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'docente', label: 'Docente' },
    { key: 'anio', label: 'Año' },
  ];

  protected readonly rows = signal<DataTableRow[]>([]);

  protected readonly filteredRows = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const data = this.rows();
    if (!q) return data;
    return data.filter((r) =>
      [r['curso'], r['nivel'], r['grado'], r['seccion'], r['anio']]
        .map((v) => String(v ?? '').toLowerCase())
        .some((v) => v.includes(q)),
    );
  });

  protected readonly pageTitle = computed(() =>
    this.roleContext.isTeacher() ? 'Mis cursos' : 'Cursos asignados',
  );

  ngOnInit(): void {
    if (this.roleContext.isTeacher()) {
      this.teacherContext.ensureLoaded();
    }
    this.catalogService.asignaturas().subscribe({
      next: (a) => this.asignaturas.set(a as { id: string; nombre: string }[]),
    });
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.anios().subscribe({
      next: (a) => {
        const list = a as { id: string; anio: number }[];
        this.anios.set(list);
        if (list.length) {
          this.anioId.set(list[0].id);
          this.filtroAnio.set(list[0].id);
          this.draftFiltroAnio.set(list[0].id);
          this.loadCursos();
        }
      },
    });
    this.catalogService.docentes().subscribe({
      next: (d) => this.docentes.set(d as { id: string; fullName: string }[]),
    });
  }

  protected onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    this.secciones.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as CatalogGrade[]),
      });
    } else {
      this.grados.set([]);
    }
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    this.seccionId.set('');
    if (this.anioId() && gradoId) {
      this.catalogService.secciones(this.anioId(), gradoId).subscribe({
        next: (s) => this.secciones.set(s as CatalogSection[]),
      });
    } else {
      this.secciones.set([]);
    }
  }

  protected onAnioChange(anioId: string): void {
    this.anioId.set(anioId);
    this.onGradoChange(this.gradoId());
  }

  protected onFiltroNivelChange(nivelId: string): void {
    this.draftFiltroNivel.set(nivelId);
    this.draftFiltroGrado.set('');
    this.draftFiltroSeccion.set('');
    this.seccionesFiltro.set([]);
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.gradosFiltro.set(g as CatalogGrade[]),
      });
    } else {
      this.gradosFiltro.set([]);
    }
  }

  protected onFiltroGradoChange(gradoId: string): void {
    this.draftFiltroGrado.set(gradoId);
    this.draftFiltroSeccion.set('');
    if (this.draftFiltroAnio() && gradoId) {
      this.catalogService.secciones(this.draftFiltroAnio(), gradoId).subscribe({
        next: (s) => this.seccionesFiltro.set(s as CatalogSection[]),
      });
    } else {
      this.seccionesFiltro.set([]);
    }
  }

  protected buscarCursosDocente(): void {
    this.searchTerm.set(this.draftSearchTerm().trim());
  }

  protected buscarCursos(): void {
    this.filtroAnio.set(this.draftFiltroAnio());
    this.filtroNivel.set(this.draftFiltroNivel());
    this.filtroGrado.set(this.draftFiltroGrado());
    this.filtroSeccion.set(this.draftFiltroSeccion());
    this.loadCursos();
  }

  protected loadCursos(): void {
    const params: Record<string, string> = {};
    if (this.filtroAnio()) params['anio_id'] = this.filtroAnio();
    if (this.filtroSeccion()) params['seccion_id'] = this.filtroSeccion();
    if (this.roleContext.isTeacher() && this.roleContext.getTeacherId()) {
      params['docente_id'] = this.roleContext.getTeacherId()!;
    }
    this.courseService.listar(params).subscribe({
      next: (courses) =>
        this.rows.set(
          courses.map((c) => ({
            _id: c.id,
            curso: c.name,
            nivel: c.level,
            grado: c.grade,
            seccion: c.section,
            docente: c.teacherName,
            anio: c.academicYear,
          })),
        ),
    });
  }

  protected registrarAsignatura(): void {
    if (!this.nuevaAsignatura().trim()) return;
    this.courseService.crearAsignatura({ nombre: this.nuevaAsignatura().trim() }).subscribe({
      next: () => {
        this.successMessage.set('Asignatura registrada.');
        this.nuevaAsignatura.set('');
        this.catalogService.asignaturas().subscribe({
          next: (a) => this.asignaturas.set(a as { id: string; nombre: string }[]),
        });
      },
    });
  }

  protected registrarCurso(): void {
    if (!this.asignaturaId() || !this.anioId() || !this.seccionId() || !this.docenteId()) return;
    this.courseService
      .crear({
        anio_academico_id: this.anioId(),
        seccion_id: this.seccionId(),
        asignatura_id: this.asignaturaId(),
        docente_id: this.docenteId(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Curso asignado correctamente.');
          this.loadCursos();
        },
      });
  }
}
