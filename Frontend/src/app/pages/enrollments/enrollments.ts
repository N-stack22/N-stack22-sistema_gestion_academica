import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { Enrollment, EnrollmentService } from '../../services/enrollment.service';

@Component({
  selector: 'app-enrollments',
  imports: [DataTable],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.scss',
})
export class Enrollments implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly editId = signal('');
  protected readonly estudianteId = signal('');
  protected readonly anioId = signal('');
  protected readonly nivelId = signal('');
  protected readonly gradoId = signal('');
  protected readonly seccionId = signal('');
  protected readonly estadoMatricula = signal('ACTIVA');
  protected readonly editSeccionOriginal = signal('');
  protected readonly editAnioOriginal = signal('');
  protected readonly filtroAnio = signal('');
  protected readonly filtroNivel = signal('');
  protected readonly filtroGrado = signal('');
  protected readonly filtroSeccion = signal('');
  protected readonly filtroEstado = signal('');
  protected readonly draftFiltroAnio = signal('');
  protected readonly draftFiltroNivel = signal('');
  protected readonly draftFiltroGrado = signal('');
  protected readonly draftFiltroSeccion = signal('');
  protected readonly draftFiltroEstado = signal('');
  protected readonly anios = signal<{ id: string; anio: number }[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly grados = signal<CatalogGrade[]>([]);
  protected readonly gradosFiltro = signal<CatalogGrade[]>([]);
  protected readonly secciones = signal<CatalogSection[]>([]);
  protected readonly seccionesFiltro = signal<CatalogSection[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string; code: string }[]>([]);
  protected readonly estadosNueva = signal<{ codigo: string; nombre: string }[]>([]);
  protected readonly estadosEdicion = signal<{ codigo: string; nombre: string }[]>([]);
  protected readonly estadosFiltro = signal<{ codigo: string; nombre: string }[]>([]);
  protected readonly matriculaVigente = signal<Enrollment | null>(null);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly editMode = computed(() => !!this.editId());

  protected readonly estudianteEdicionLabel = computed(() => {
    const e = this.estudiantes().find((x) => x.id === this.estudianteId());
    return e ? `${e.code} — ${e.fullName}` : '';
  });

  protected readonly seccionSeleccionada = computed(() =>
    this.secciones().find((s) => s.id === this.seccionId()) ?? null,
  );

  protected readonly seccionSinCupos = computed(() => {
    const sec = this.seccionSeleccionada();
    if (!sec) return false;
    const estado = this.estadoMatricula() || 'ACTIVA';
    if (estado === 'RETIRADA') return false;
    if (
      this.editMode() &&
      this.seccionId() === this.editSeccionOriginal() &&
      this.anioId() === this.editAnioOriginal()
    ) {
      return false;
    }
    return (sec.cuposDisponibles ?? sec.capacidad ?? 0) <= 0;
  });

  protected readonly matriculaVigenteBloquea = computed(() => {
    const vigente = this.matriculaVigente();
    if (!vigente) return false;
    if (this.editMode() && vigente.id === this.editId()) return false;
    return true;
  });

  protected readonly noPuedeGuardar = computed(
    () => this.seccionSinCupos() || (!this.editMode() && this.matriculaVigenteBloquea()),
  );

  protected readonly mensajeMatriculaVigente = computed(() => {
    const m = this.matriculaVigente();
    if (!m || !this.matriculaVigenteBloquea()) return '';
    const ubicacion = [m.level, m.grade, m.section].filter(Boolean).join(' ');
    return `Ya tiene matrícula vigente (${m.status}) en ${m.academicYear} — ${ubicacion}. Debe retirarla antes de matricularlo en otro nivel o sección.`;
  });

  protected readonly columns: DataTableColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'grado', label: 'Grado' },
    { key: 'seccion', label: 'Sección' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
  ];

  ngOnInit(): void {
    this.catalogService.anios().subscribe({
      next: (anios) => {
        const list = anios as { id: string; anio: number }[];
        this.anios.set(list);
      },
    });
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.catalogService.estadosMatricula('nueva').subscribe({
      next: (e) => this.estadosNueva.set(e as { codigo: string; nombre: string }[]),
    });
    this.catalogService.estadosMatricula('filtro').subscribe({
      next: (e) => {
        const list = e as { codigo: string; nombre: string }[];
        this.estadosEdicion.set(list);
        this.estadosFiltro.set(list);
      },
    });
    this.catalogService.estudiantes().subscribe({
      next: (s) =>
        this.estudiantes.set(
          (s as { id: string; fullName: string; code: string }[]).map((e) => ({
            id: e.id,
            fullName: e.fullName,
            code: e.code,
          })),
        ),
    });
    this.route.queryParams.subscribe((params) => {
      if (params['estudianteId']) {
        this.onEstudianteChange(params['estudianteId']);
      }
    });
    this.loadMatriculas();
  }

  protected onEstudianteChange(estudianteId: string): void {
    if (this.editMode()) return;
    this.estudianteId.set(estudianteId);
    this.matriculaVigente.set(null);
    if (!estudianteId) return;
    this.enrollmentService.listar({ estudiante_id: estudianteId }).subscribe({
      next: (items) => {
        const vigente =
          items.find((m) => m.statusCode === 'ACTIVA' || m.statusCode === 'PENDIENTE') ?? null;
        this.matriculaVigente.set(vigente);
      },
    });
  }

  protected onNivelChange(nivelId: string): void {
    this.nivelId.set(nivelId);
    this.gradoId.set('');
    this.seccionId.set('');
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.grados.set(g as CatalogGrade[]),
      });
    } else {
      this.grados.set([]);
      this.secciones.set([]);
    }
  }

  protected onGradoChange(gradoId: string): void {
    this.gradoId.set(gradoId);
    this.loadSecciones();
  }

  protected onAnioChange(anioId: string): void {
    this.anioId.set(anioId);
    if (this.gradoId()) {
      this.loadSecciones();
    } else {
      this.seccionId.set('');
      this.secciones.set([]);
    }
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

  protected onFiltroAnioChange(anioId: string): void {
    this.draftFiltroAnio.set(anioId);
    this.onFiltroGradoChange(this.draftFiltroGrado());
  }

  protected buscarMatriculas(): void {
    this.filtroAnio.set(this.draftFiltroAnio());
    this.filtroNivel.set(this.draftFiltroNivel());
    this.filtroGrado.set(this.draftFiltroGrado());
    this.filtroSeccion.set(this.draftFiltroSeccion());
    this.filtroEstado.set(this.draftFiltroEstado());
    this.loadMatriculas();
  }

  protected loadSecciones(preserveSeccionId = false): void {
    const current = preserveSeccionId ? this.seccionId() : '';
    if (!preserveSeccionId) {
      this.seccionId.set('');
    }
    if (!this.anioId() || !this.gradoId()) {
      this.secciones.set([]);
      return;
    }
    this.catalogService.secciones(this.anioId(), this.gradoId()).subscribe({
      next: (secs) => {
        this.secciones.set(secs as CatalogSection[]);
        if (preserveSeccionId && current) {
          this.seccionId.set(current);
        }
      },
    });
  }

  protected loadMatriculas(): void {
    const params: Record<string, string> = {};
    if (this.filtroAnio()) params['anio_id'] = this.filtroAnio();
    if (this.filtroNivel()) params['nivel_id'] = this.filtroNivel();
    if (this.filtroGrado()) params['grado_id'] = this.filtroGrado();
    if (this.filtroSeccion()) params['seccion_id'] = this.filtroSeccion();
    if (this.filtroEstado()) params['estado'] = this.filtroEstado();
    this.enrollmentService.listar(params).subscribe({
      next: (items) => {
        this.rows.set(
          items.map((m, i) => ({
            _id: String(m.id || `matricula-${i}`),
            codigo: m.studentCode,
            estudiante: m.studentName,
            nivel: m.level,
            grado: m.grade,
            seccion: m.section,
            estado: m.status,
            fecha: m.enrollmentDate,
          })),
        );
      },
    });
  }

  protected guardarMatricula(): void {
    if (!this.estudianteId() || !this.anioId() || !this.seccionId()) return;
    if (!this.editMode() && this.matriculaVigenteBloquea()) {
      this.errorMessage.set(this.mensajeMatriculaVigente());
      return;
    }
    if (this.seccionSinCupos()) {
      this.errorMessage.set('La sección seleccionada no tiene cupos disponibles.');
      return;
    }
    this.errorMessage.set('');

    const payload = {
      anio_academico_id: this.anioId(),
      seccion_id: this.seccionId(),
      estado_codigo: this.estadoMatricula() || 'ACTIVA',
    };

    const request$ = this.editMode()
      ? this.enrollmentService.actualizar(this.editId(), payload)
      : this.enrollmentService.crear({
          estudiante_id: this.estudianteId(),
          ...payload,
        });

    request$.subscribe({
      next: () => {
        this.successMessage.set(
          this.editMode() ? 'Matrícula actualizada correctamente.' : 'Matrícula registrada correctamente.',
        );
        if (this.editMode()) {
          this.cancelEdit();
        } else {
          this.onEstudianteChange(this.estudianteId());
        }
        this.catalogService.invalidate();
        this.loadSecciones();
        this.loadMatriculas();
      },
      error: (err) => {
        this.successMessage.set('');
        this.errorMessage.set(
          err?.error?.detail ??
            (this.editMode() ? 'No se pudo actualizar la matrícula.' : 'No se pudo registrar la matrícula.'),
        );
      },
    });
  }

  protected onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.enrollmentService.obtener(id).subscribe({
      next: (m) => this.iniciarEdicion(m),
    });
  }

  protected iniciarEdicion(m: Enrollment): void {
    this.editId.set(m.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.estudianteId.set(m.studentId);
    this.anioId.set(m.academicYearId ?? '');
    this.nivelId.set(m.levelId ?? '');
    this.gradoId.set(m.gradeId ?? '');
    this.seccionId.set(m.sectionId ?? '');
    this.estadoMatricula.set(m.statusCode ?? 'ACTIVA');
    this.editSeccionOriginal.set(m.sectionId ?? '');
    this.editAnioOriginal.set(m.academicYearId ?? '');
    this.matriculaVigente.set(null);

    if (m.levelId) {
      this.catalogService.grados(m.levelId).subscribe({
        next: (g) => {
          this.grados.set(g as CatalogGrade[]);
          this.loadSecciones(true);
        },
      });
    }
  }

  protected cancelEdit(): void {
    this.editId.set('');
    this.estudianteId.set('');
    this.anioId.set('');
    this.nivelId.set('');
    this.gradoId.set('');
    this.seccionId.set('');
    this.estadoMatricula.set('ACTIVA');
    this.editSeccionOriginal.set('');
    this.editAnioOriginal.set('');
    this.grados.set([]);
    this.secciones.set([]);
    this.matriculaVigente.set(null);
  }
}
