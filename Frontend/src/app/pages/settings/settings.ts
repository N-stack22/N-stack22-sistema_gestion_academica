import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CatalogGrade, CatalogSection, CatalogService } from '../../services/catalog.service';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';

interface SettingsCard {
  title: string;
  icon: string;
  description: string;
  key: string;
}

interface AcademicYear {
  id: string;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

interface AcademicPeriod {
  id: string;
  nombre: string;
  orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  anio_academico_id: string;
}

interface PaymentMethod {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly settingsService = inject(SettingsService);
  private readonly catalogService = inject(CatalogService);
  private readonly themeService = inject(ThemeService);
  protected readonly auth = inject(AuthService);

  protected readonly institucional = signal<Record<string, unknown> | null>(null);
  protected readonly personal = signal<Record<string, unknown> | null>(null);
  protected readonly activeSection = signal('personal');
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly anioActivoId = signal('');
  protected readonly secciones = signal<CatalogSection[]>([]);
  protected readonly niveles = signal<{ id: string; nombre: string }[]>([]);
  protected readonly gradosNueva = signal<CatalogGrade[]>([]);
  protected readonly nuevaSeccionNivel = signal('');
  protected readonly nuevaSeccionGrado = signal('');
  protected readonly nuevaSeccionNombre = signal('A');
  protected readonly nuevaSeccionAula = signal('');
  protected readonly nuevaSeccionCapacidad = signal(30);
  protected readonly editDrafts = signal<Record<string, { aula: string; capacidad: number }>>({});

  protected readonly nuevoAnio = signal(new Date().getFullYear() + 1);
  protected readonly nuevoAnioInicio = signal('');
  protected readonly nuevoAnioFin = signal('');
  protected readonly nuevoAnioActivo = signal(false);

  protected readonly periodoAnioId = signal('');
  protected readonly periodoNombre = signal('');
  protected readonly periodoOrden = signal(1);
  protected readonly periodoInicio = signal('');
  protected readonly periodoFin = signal('');

  protected readonly metodoCodigo = signal('');
  protected readonly metodoNombre = signal('');

  protected readonly canManageInstitutional = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'ADMIN' || role === 'DIRECTOR';
  });

  protected readonly academicYears = computed(
    () => (this.institucional()?.['academicYears'] as AcademicYear[]) ?? [],
  );

  protected readonly periodsForSelectedYear = computed(() => {
    const anioId = this.periodoAnioId() || this.anioActivoId();
    const periods = (this.institucional()?.['periods'] as AcademicPeriod[]) ?? [];
    return periods.filter((p) => p.anio_academico_id === anioId);
  });

  protected readonly paymentMethods = computed(() => {
    const methods = (this.institucional()?.['paymentMethods'] as PaymentMethod[]) ?? [];
    const seen = new Map<string, PaymentMethod>();
    for (const m of methods) {
      const key = (m.codigo || '').trim().toUpperCase();
      if (!key) continue;
      const current = seen.get(key);
      if (!current || (m.activo && !current.activo)) {
        seen.set(key, m);
      }
    }
    return [...seen.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  protected readonly cards: SettingsCard[] = [
    {
      key: 'personal',
      title: 'Configuración personal',
      icon: 'bi-person',
      description: 'Perfil, preferencias de notificación y tema.',
    },
    {
      key: 'institucional',
      title: 'Configuración institucional',
      icon: 'bi-building',
      description: 'Años, periodos, métodos de pago y estructura académica.',
    },
  ];

  ngOnInit(): void {
    this.loadPersonal();
    this.catalogService.niveles().subscribe({
      next: (n) => this.niveles.set(n as { id: string; nombre: string }[]),
    });
    this.loadInstitucional();
  }

  protected loadPersonal(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.settingsService.personal(user.id).subscribe({
      next: (data) => {
        this.personal.set(data);
        this.themeService.syncFromServer(!!data['tema_oscuro']);
      },
      error: () => {
        this.personal.set({
          perfil_id: user.id,
          nombre_completo: user.fullName,
          email: user.email,
          tema_oscuro: this.themeService.isDark(),
          notificaciones_email: true,
          notificaciones_push: true,
        });
        this.errorMessage.set('No se pudieron cargar todas las preferencias. Puede cambiar el tema igualmente.');
      },
    });
  }

  protected loadInstitucional(): void {
    this.settingsService.institucional().subscribe({
      next: (data) => {
        this.institucional.set(data);
        const anios = (data['academicYears'] as AcademicYear[]) ?? [];
        const activo = anios.find((a) => a.activo) ?? anios[0];
        if (activo) {
          this.anioActivoId.set(activo.id);
          if (!this.periodoAnioId()) this.periodoAnioId.set(activo.id);
          this.nuevoAnioInicio.set(`${activo.anio + 1}-03-01`);
          this.nuevoAnioFin.set(`${activo.anio + 1}-12-20`);
        }
        const secs = (data['sections'] as CatalogSection[]) ?? [];
        this.secciones.set(secs);
        const drafts: Record<string, { aula: string; capacidad: number }> = {};
        secs.forEach((s) => {
          drafts[s.id] = { aula: s.aula ?? '', capacidad: s.capacidad ?? 30 };
        });
        this.editDrafts.set(drafts);
      },
    });
  }

  private reloadInstitutionalData(): void {
    this.catalogService.invalidate();
    this.loadInstitucional();
  }

  protected selectSection(key: string): void {
    this.activeSection.set(key);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected roleLabel(role?: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      DIRECTOR: 'Director(a)',
      TEACHER: 'Docente',
      STUDENT: 'Estudiante',
      PARENT: 'Padre/Madre',
    };
    return labels[role ?? ''] ?? role ?? '—';
  }

  protected toggleTema(checked: boolean): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.themeService.apply(checked);
    this.settingsService.guardarPersonal(user.id, { tema_oscuro: checked }).subscribe({
      next: (data) => {
        this.personal.set(data);
        this.successMessage.set('Preferencias guardadas.');
        this.errorMessage.set('');
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar el tema.');
      },
    });
  }

  protected activarAnio(anioId: string): void {
    this.settingsService.actualizarAnio(anioId, { activo: true }).subscribe({
      next: () => {
        this.successMessage.set('Año académico activo actualizado.');
        this.reloadInstitutionalData();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo activar el año.'),
    });
  }

  protected crearAnio(): void {
    const anio = this.nuevoAnio();
    if (!this.nuevoAnioInicio() || !this.nuevoAnioFin()) {
      this.errorMessage.set('Indique fecha de inicio y fin del año académico.');
      return;
    }
    this.settingsService
      .crearAnio({
        anio,
        fecha_inicio: this.nuevoAnioInicio(),
        fecha_fin: this.nuevoAnioFin(),
        activo: this.nuevoAnioActivo(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set(`Año académico ${anio} registrado.`);
          this.errorMessage.set('');
          this.nuevoAnio.set(anio + 1);
          this.nuevoAnioInicio.set(`${anio + 1}-03-01`);
          this.nuevoAnioFin.set(`${anio + 1}-12-20`);
          this.reloadInstitutionalData();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo crear el año académico.'),
      });
  }

  protected crearPeriodo(): void {
    const anioId = this.periodoAnioId();
    if (!anioId || !this.periodoNombre().trim() || !this.periodoInicio() || !this.periodoFin()) {
      this.errorMessage.set('Complete año, nombre y fechas del periodo.');
      return;
    }
    this.settingsService
      .crearPeriodo({
        anio_academico_id: anioId,
        nombre: this.periodoNombre().trim(),
        orden: this.periodoOrden(),
        fecha_inicio: this.periodoInicio(),
        fecha_fin: this.periodoFin(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Periodo académico registrado.');
          this.errorMessage.set('');
          this.periodoNombre.set('');
          this.periodoOrden.set(this.periodsForSelectedYear().length + 2);
          this.periodoInicio.set('');
          this.periodoFin.set('');
          this.reloadInstitutionalData();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo crear el periodo.'),
      });
  }

  protected agregarMetodoPago(): void {
    if (!this.metodoCodigo().trim() || !this.metodoNombre().trim()) {
      this.errorMessage.set('Indique código y nombre del método de pago.');
      return;
    }
    this.settingsService
      .crearMetodoPago({ codigo: this.metodoCodigo().trim(), nombre: this.metodoNombre().trim() })
      .subscribe({
        next: () => {
          this.successMessage.set('Método de pago agregado.');
          this.errorMessage.set('');
          this.metodoCodigo.set('');
          this.metodoNombre.set('');
          this.reloadInstitutionalData();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo agregar el método.'),
      });
  }

  protected quitarMetodoPago(metodo: PaymentMethod): void {
    if (!metodo.activo) return;
    this.settingsService.actualizarMetodoPago(metodo.id, { activo: false }).subscribe({
      next: () => {
        this.successMessage.set(`Método "${metodo.nombre}" desactivado.`);
        this.reloadInstitutionalData();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo quitar el método.'),
    });
  }

  protected reactivarMetodoPago(metodo: PaymentMethod): void {
    this.settingsService.actualizarMetodoPago(metodo.id, { activo: true }).subscribe({
      next: () => {
        this.successMessage.set(`Método "${metodo.nombre}" reactivado.`);
        this.reloadInstitutionalData();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo reactivar el método.'),
    });
  }

  protected onNuevaSeccionNivel(nivelId: string): void {
    this.nuevaSeccionNivel.set(nivelId);
    this.nuevaSeccionGrado.set('');
    if (nivelId) {
      this.catalogService.grados(nivelId).subscribe({
        next: (g) => this.gradosNueva.set(g as CatalogGrade[]),
      });
    } else {
      this.gradosNueva.set([]);
    }
  }

  protected crearSeccion(): void {
    if (!this.anioActivoId() || !this.nuevaSeccionGrado() || !this.nuevaSeccionNombre().trim()) {
      this.errorMessage.set('Seleccione grado y nombre de sección.');
      return;
    }
    this.settingsService
      .crearSeccion({
        anio_academico_id: this.anioActivoId(),
        grado_id: this.nuevaSeccionGrado(),
        nombre: this.nuevaSeccionNombre().trim(),
        aula: this.nuevaSeccionAula().trim() || undefined,
        capacidad: this.nuevaSeccionCapacidad(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Sección creada correctamente.');
          this.errorMessage.set('');
          this.reloadInstitutionalData();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo crear la sección.'),
      });
  }

  protected updateDraft(seccionId: string, field: 'aula' | 'capacidad', value: string): void {
    const current = { ...this.editDrafts() };
    const draft = current[seccionId] ?? { aula: '', capacidad: 30 };
    if (field === 'capacidad') {
      draft.capacidad = Number(value) || 0;
    } else {
      draft.aula = value;
    }
    current[seccionId] = draft;
    this.editDrafts.set(current);
  }

  protected guardarSeccion(seccionId: string): void {
    const draft = this.editDrafts()[seccionId];
    if (!draft) return;
    this.settingsService
      .actualizarSeccion(seccionId, { aula: draft.aula, capacidad: draft.capacidad })
      .subscribe({
        next: () => {
          this.successMessage.set('Sección actualizada.');
          this.reloadInstitutionalData();
        },
        error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo actualizar la sección.'),
      });
  }
}
