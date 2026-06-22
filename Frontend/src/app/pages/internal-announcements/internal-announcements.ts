import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AuthService } from '../../services/auth.service';
import { InternalAnnouncementService } from '../../services/internal-announcement.service';
import { CatalogService } from '../../services/catalog.service';
import { EventService } from '../../services/event.service';
import { RoleContextService } from '../../services/role-context.service';
import { ParentContextService } from '../../services/parent-context.service';

@Component({
  selector: 'app-internal-announcements',
  imports: [DataTable],
  templateUrl: './internal-announcements.html',
  styleUrl: './internal-announcements.scss',
})
export class InternalAnnouncements implements OnInit {
  private readonly announcementService = inject(InternalAnnouncementService);
  private readonly eventService = inject(EventService);
  private readonly catalogService = inject(CatalogService);
  private readonly auth = inject(AuthService);
  public readonly roleContext = inject(RoleContextService);
  private readonly parentContext = inject(ParentContextService);

  public readonly isInstitutional = computed(() => this.roleContext.isInstitutional());

  public readonly activeTab = signal<'comunicados' | 'eventos'>('comunicados');

  public readonly editComunicadoId = signal('');
  public readonly titulo = signal('');
  public readonly contenido = signal('');
  public readonly rolDestino = signal('');
  public readonly publicado = signal(true);

  public readonly editEventoId = signal('');
  public readonly eventoTitulo = signal('');
  public readonly eventoDescripcion = signal('');
  public readonly eventoInicio = signal('');
  public readonly eventoFin = signal('');
  public readonly eventoLugar = signal('');
  public readonly eventoRolDestino = signal('');

  public readonly successMessage = signal('');
  public readonly errorMessage = signal('');
  public readonly roles = signal<{ codigo: string; nombre: string }[]>([]);

  public readonly editModeComunicado = computed(() => !!this.editComunicadoId());
  public readonly editModeEvento = computed(() => !!this.editEventoId());

  public readonly comunicadoColumns: DataTableColumn[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'destinatario', label: 'Destinatario' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  public readonly eventoColumns: DataTableColumn[] = [
    { key: 'titulo', label: 'Evento' },
    { key: 'inicio', label: 'Inicio' },
    { key: 'lugar', label: 'Lugar' },
    { key: 'destinatario', label: 'Destinatario' },
  ];

  public readonly comunicadoRows = signal<DataTableRow[]>([]);
  public readonly eventoRows = signal<DataTableRow[]>([]);

  public readonly draftFiltroComBusqueda = signal('');
  public readonly draftFiltroComDestinatario = signal('');
  public readonly draftFiltroComEstado = signal('');
  public readonly filtroComBusqueda = signal('');
  public readonly filtroComDestinatario = signal('');
  public readonly filtroComEstado = signal('');

  public readonly draftFiltroEvtBusqueda = signal('');
  public readonly draftFiltroEvtDestinatario = signal('');
  public readonly draftFiltroEvtPeriodo = signal('');
  public readonly filtroEvtBusqueda = signal('');
  public readonly filtroEvtDestinatario = signal('');
  public readonly filtroEvtPeriodo = signal('');

  public readonly selectedComunicado = signal<{
    title: string;
    content: string;
    audience: string;
    date: string;
    status: string;
    fileUrl?: string;
  } | null>(null);
  public readonly detailLoading = signal(false);

  public readonly proximosEventos = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.eventoRowsFiltrados().filter((e) => String(e['inicio'] ?? '').slice(0, 10) >= hoy);
  });

  public readonly eventosPasados = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.eventoRowsFiltrados().filter((e) => String(e['inicio'] ?? '').slice(0, 10) < hoy);
  });

  public readonly comunicadoRowsFiltrados = computed(() => {
    let rows = this.comunicadoRows();
    const q = this.filtroComBusqueda().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r['titulo'] ?? '').toLowerCase().includes(q) ||
          String(r['destinatario'] ?? '').toLowerCase().includes(q),
      );
    }
    if (this.filtroComDestinatario()) {
      rows = rows.filter((r) => String(r['destinatario'] ?? '').includes(this.filtroComDestinatario()));
    }
    if (this.filtroComEstado()) {
      rows = rows.filter((r) => String(r['estado'] ?? '') === this.filtroComEstado());
    }
    return rows;
  });

  public readonly eventoRowsFiltrados = computed(() => {
    let rows = this.eventoRows();
    const q = this.filtroEvtBusqueda().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r['titulo'] ?? '').toLowerCase().includes(q) ||
          String(r['lugar'] ?? '').toLowerCase().includes(q) ||
          String(r['destinatario'] ?? '').toLowerCase().includes(q),
      );
    }
    if (this.filtroEvtDestinatario()) {
      rows = rows.filter((r) => String(r['destinatario'] ?? '').includes(this.filtroEvtDestinatario()));
    }
    const periodo = this.filtroEvtPeriodo();
    if (periodo) {
      const hoy = new Date().toISOString().slice(0, 10);
      rows = rows.filter((r) => {
        const fecha = String(r['inicio'] ?? '').slice(0, 10);
        return periodo === 'proximos' ? fecha >= hoy : fecha < hoy;
      });
    }
    return rows;
  });

  constructor() {
    effect(() => {
      if (!this.roleContext.isParent() || !this.roleContext.isReady()) return;
      const id = this.parentContext.selectedStudentId();
      if (!id) return;
      this.loadAnnouncements();
    });
  }

  ngOnInit(): void {
    this.catalogService.roles().subscribe({
      next: (roles) => this.roles.set(roles as { codigo: string; nombre: string }[]),
    });
    this.roleContext.whenReady(() => this.loadAnnouncements());
    this.loadEventos();
  }

  public setTab(tab: 'comunicados' | 'eventos'): void {
    this.activeTab.set(tab);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  public buscarComunicados(): void {
    this.filtroComBusqueda.set(this.draftFiltroComBusqueda().trim());
    this.filtroComDestinatario.set(this.draftFiltroComDestinatario());
    this.filtroComEstado.set(this.draftFiltroComEstado());
  }

  public buscarEventos(): void {
    this.filtroEvtBusqueda.set(this.draftFiltroEvtBusqueda().trim());
    this.filtroEvtDestinatario.set(this.draftFiltroEvtDestinatario());
    this.filtroEvtPeriodo.set(this.draftFiltroEvtPeriodo());
  }

  public loadAnnouncements(): void {
    if (this.roleContext.requiresStudentScope() && !this.roleContext.getStudentId()) {
      this.comunicadoRows.set([]);
      return;
    }

    const docenteId =
      this.roleContext.isTeacher() && this.roleContext.getTeacherId()
        ? this.roleContext.getTeacherId()!
        : undefined;
    const estudianteId =
      (this.roleContext.isStudent() || this.roleContext.isParent()) && this.roleContext.getStudentId()
        ? this.roleContext.getStudentId()!
        : undefined;
    const familia = this.roleContext.isParent();
    this.announcementService.listar(docenteId, estudianteId, familia).subscribe({
      next: (items) =>
        this.comunicadoRows.set(
          items.map((a) => ({
            _id: a.id,
            titulo: a.title,
            destinatario: a.audience,
            fecha: a.date,
            estado: a.status,
          })),
        ),
    });
  }

  public loadEventos(): void {
    this.eventService.listar().subscribe({
      next: (items) =>
        this.eventoRows.set(
          items.map((e) => ({
            _id: e.id,
            titulo: e.title,
            inicio: e.startDate,
            fin: e.endDate ?? '—',
            lugar: e.place || '—',
            destinatario: e.audience,
          })),
        ),
    });
  }

  public guardarComunicado(): void {
    if (!this.titulo().trim() || !this.contenido().trim()) return;

    this.errorMessage.set('');
    const payload = {
      titulo: this.titulo().trim(),
      contenido: this.contenido().trim(),
      rol_destinatario_codigo: this.rolDestino() || '',
      publicado: this.publicado(),
    };

    const request$ = this.editModeComunicado()
      ? this.announcementService.actualizar(this.editComunicadoId(), payload)
      : (() => {
          const user = this.auth.currentUser();
          if (!user) return null;
          return this.announcementService.crear({
            ...payload,
            autor_id: user.id,
            rol_destinatario_codigo: this.rolDestino() || undefined,
          });
        })();

    if (!request$) return;

    request$.subscribe({
      next: () => {
        this.successMessage.set(
          this.editModeComunicado()
            ? 'Comunicado actualizado correctamente.'
            : 'Comunicado publicado correctamente.',
        );
        this.cancelarEdicionComunicado();
        this.loadAnnouncements();
      },
      error: (err) =>
        this.errorMessage.set(
          err?.error?.detail ??
            (this.editModeComunicado()
              ? 'No se pudo actualizar el comunicado.'
              : 'No se pudo publicar el comunicado.'),
        ),
    });
  }

  public editarComunicado(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    if (!this.isInstitutional()) {
      this.verDetalleComunicado(row);
      return;
    }
    this.errorMessage.set('');
    this.announcementService.obtener(String(id)).subscribe({
      next: (a) => {
        this.editComunicadoId.set(a.id);
        this.titulo.set(a.title);
        this.contenido.set(a.content);
        this.rolDestino.set(a.audienceRoleCode ?? '');
        this.publicado.set(a.status === 'Publicado');
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo cargar el comunicado.'),
    });
  }

  public verDetalleComunicado(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.detailLoading.set(true);
    this.selectedComunicado.set(null);
    this.announcementService.obtener(String(id)).subscribe({
      next: (a) => {
        this.selectedComunicado.set({
          title: a.title,
          content: a.content,
          audience: a.audience,
          date: a.date,
          status: a.status,
          fileUrl: a.fileUrl,
        });
        this.detailLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'No se pudo cargar el comunicado.');
        this.detailLoading.set(false);
      },
    });
  }

  public cerrarDetalle(): void {
    this.selectedComunicado.set(null);
  }

  public eliminarComunicado(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    if (!window.confirm('¿Eliminar este comunicado? Esta acción no se puede deshacer.')) return;

    this.errorMessage.set('');
    this.announcementService.eliminar(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Comunicado eliminado.');
        if (this.editComunicadoId() === id) this.cancelarEdicionComunicado();
        this.loadAnnouncements();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo eliminar el comunicado.'),
    });
  }

  public cancelarEdicionComunicado(): void {
    this.editComunicadoId.set('');
    this.titulo.set('');
    this.contenido.set('');
    this.rolDestino.set('');
    this.publicado.set(true);
  }

  public guardarEvento(): void {
    if (!this.eventoTitulo().trim() || !this.eventoInicio()) {
      this.errorMessage.set('Título y fecha de inicio son obligatorios.');
      return;
    }

    this.errorMessage.set('');
    const payload = {
      titulo: this.eventoTitulo().trim(),
      descripcion: this.eventoDescripcion().trim() || '',
      fecha_inicio: this.eventoInicio(),
      fecha_fin: this.eventoFin() || '',
      lugar: this.eventoLugar().trim() || '',
      rol_destinatario_codigo: this.eventoRolDestino() || '',
    };

    const request$ = this.editModeEvento()
      ? this.eventService.actualizar(this.editEventoId(), payload)
      : (() => {
          const user = this.auth.currentUser();
          if (!user) return null;
          return this.eventService.crear({
            ...payload,
            descripcion: payload.descripcion || undefined,
            fecha_fin: payload.fecha_fin || undefined,
            lugar: payload.lugar || undefined,
            creado_por_perfil_id: user.id,
            rol_destinatario_codigo: this.eventoRolDestino() || undefined,
          });
        })();

    if (!request$) return;

    request$.subscribe({
      next: () => {
        this.successMessage.set(
          this.editModeEvento() ? 'Evento actualizado correctamente.' : 'Evento programado correctamente.',
        );
        this.cancelarEdicionEvento();
        this.loadEventos();
      },
      error: (err) =>
        this.errorMessage.set(
          err?.error?.detail ??
            (this.editModeEvento() ? 'No se pudo actualizar el evento.' : 'No se pudo programar el evento.'),
        ),
    });
  }

  public editarEvento(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.errorMessage.set('');
    this.eventService.obtener(String(id)).subscribe({
      next: (e) => {
        this.editEventoId.set(e.id);
        this.eventoTitulo.set(e.title);
        this.eventoDescripcion.set(e.description ?? '');
        this.eventoInicio.set(this.toDatetimeLocal(e.startDate));
        this.eventoFin.set(e.endDate ? this.toDatetimeLocal(e.endDate) : '');
        this.eventoLugar.set(e.place ?? '');
        this.eventoRolDestino.set(e.audienceRoleCode ?? '');
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo cargar el evento.'),
    });
  }

  public eliminarEvento(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    if (!window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;

    this.errorMessage.set('');
    this.eventService.eliminar(String(id)).subscribe({
      next: () => {
        this.successMessage.set('Evento eliminado.');
        if (this.editEventoId() === id) this.cancelarEdicionEvento();
        this.loadEventos();
      },
      error: (err) => this.errorMessage.set(err?.error?.detail ?? 'No se pudo eliminar el evento.'),
    });
  }

  public cancelarEdicionEvento(): void {
    this.editEventoId.set('');
    this.eventoTitulo.set('');
    this.eventoDescripcion.set('');
    this.eventoInicio.set('');
    this.eventoFin.set('');
    this.eventoLugar.set('');
    this.eventoRolDestino.set('');
  }

  private toDatetimeLocal(value: string): string {
    if (!value) return '';
    return value.slice(0, 16).replace(' ', 'T');
  }
}
