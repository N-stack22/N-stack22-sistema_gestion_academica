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
  protected readonly roleContext = inject(RoleContextService);
  private readonly parentContext = inject(ParentContextService);

  protected readonly isInstitutional = computed(() => this.roleContext.isInstitutional());

  protected readonly activeTab = signal<'comunicados' | 'eventos'>('comunicados');

  protected readonly editComunicadoId = signal('');
  protected readonly titulo = signal('');
  protected readonly contenido = signal('');
  protected readonly rolDestino = signal('');
  protected readonly publicado = signal(true);

  protected readonly editEventoId = signal('');
  protected readonly eventoTitulo = signal('');
  protected readonly eventoDescripcion = signal('');
  protected readonly eventoInicio = signal('');
  protected readonly eventoFin = signal('');
  protected readonly eventoLugar = signal('');
  protected readonly eventoRolDestino = signal('');

  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly roles = signal<{ codigo: string; nombre: string }[]>([]);

  protected readonly editModeComunicado = computed(() => !!this.editComunicadoId());
  protected readonly editModeEvento = computed(() => !!this.editEventoId());

  protected readonly comunicadoColumns: DataTableColumn[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'destinatario', label: 'Destinatario' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly eventoColumns: DataTableColumn[] = [
    { key: 'titulo', label: 'Evento' },
    { key: 'inicio', label: 'Inicio' },
    { key: 'lugar', label: 'Lugar' },
    { key: 'destinatario', label: 'Destinatario' },
  ];

  protected readonly comunicadoRows = signal<DataTableRow[]>([]);
  protected readonly eventoRows = signal<DataTableRow[]>([]);

  protected readonly selectedComunicado = signal<{
    title: string;
    content: string;
    audience: string;
    date: string;
    status: string;
    fileUrl?: string;
  } | null>(null);
  protected readonly detailLoading = signal(false);

  protected readonly proximosEventos = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.eventoRows().filter((e) => String(e['inicio'] ?? '').slice(0, 10) >= hoy);
  });

  protected readonly eventosPasados = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.eventoRows().filter((e) => String(e['inicio'] ?? '').slice(0, 10) < hoy);
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
    if (this.isInstitutional()) {
      this.catalogService.roles().subscribe({
        next: (roles) => this.roles.set(roles as { codigo: string; nombre: string }[]),
      });
    }
    this.roleContext.whenReady(() => this.loadAnnouncements());
    this.loadEventos();
  }

  protected setTab(tab: 'comunicados' | 'eventos'): void {
    this.activeTab.set(tab);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected loadAnnouncements(): void {
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
    this.announcementService.listar(docenteId, estudianteId).subscribe({
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

  protected loadEventos(): void {
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

  protected guardarComunicado(): void {
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

  protected editarComunicado(row: DataTableRow): void {
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

  protected verDetalleComunicado(row: DataTableRow): void {
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

  protected cerrarDetalle(): void {
    this.selectedComunicado.set(null);
  }

  protected eliminarComunicado(row: DataTableRow): void {
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

  protected cancelarEdicionComunicado(): void {
    this.editComunicadoId.set('');
    this.titulo.set('');
    this.contenido.set('');
    this.rolDestino.set('');
    this.publicado.set(true);
  }

  protected guardarEvento(): void {
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

  protected editarEvento(row: DataTableRow): void {
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

  protected eliminarEvento(row: DataTableRow): void {
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

  protected cancelarEdicionEvento(): void {
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
