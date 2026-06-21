import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { ParentService } from '../../services/parent.service';
import { RoleContextService } from '../../services/role-context.service';
import { CatalogService } from '../../services/catalog.service';
import { isRequired, emailFormatError, phoneNineDigits } from '../../utils/form-validation';

@Component({
  selector: 'app-parents',
  imports: [DataTable],
  templateUrl: './parents.html',
  styleUrl: './parents.scss',
})
export class Parents implements OnInit {
  private readonly parentService = inject(ParentService);
  private readonly catalogService = inject(CatalogService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly familyProfile = computed(() => this.roleContext.getFamilyProfile());
  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly estudiantes = signal<{ id: string; fullName: string; code: string }[]>([]);

  protected readonly draftSearchFilter = signal('');
  protected readonly draftParentescoFilter = signal('');
  protected readonly draftEstadoFilter = signal('');
  protected readonly searchFilter = signal('');
  protected readonly parentescoFilter = signal('');
  protected readonly estadoFilter = signal('');

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly parentesco = signal('Madre');
  protected readonly estudianteId = signal('');
  protected readonly esPrincipal = signal(true);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Padre o apoderado' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'parentesco', label: 'Parentesco' },
    { key: 'principal', label: 'Principal' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    { key: 'estado', label: 'Estado' },
  ];

  ngOnInit(): void {
    this.loadParents();
    this.catalogService.estudiantes().subscribe({
      next: (items) =>
        this.estudiantes.set(
          (items as { id: string; fullName: string; code: string }[]).map((e) => ({
            id: e.id,
            fullName: e.fullName,
            code: e.code,
          })),
        ),
    });
  }

  protected loadParents(): void {
    this.parentService
      .listar({
        busqueda: this.searchFilter() || undefined,
        parentesco: this.parentescoFilter() || undefined,
        estado: this.estadoFilter() || undefined,
      })
      .subscribe({
      next: (parents) =>
        this.rows.set(
          parents.map((p) => ({
            _id: p.id,
            nombre: p.fullName,
            estudiante: p.studentName,
            parentesco: p.relationship,
            principal: (p as { isPrimary?: string }).isPrimary ?? '—',
            telefono: p.phone,
            correo: p.email,
            estado: (p as { status?: string }).status ?? 'Activo',
          })),
        ),
    });
  }

  protected buscar(): void {
    this.searchFilter.set(this.draftSearchFilter().trim());
    this.parentescoFilter.set(this.draftParentescoFilter());
    this.estadoFilter.set(this.draftEstadoFilter());
    this.loadParents();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.firstName().trim() || !this.lastName().trim()) {
      this.errorMessage.set('Nombres y apellidos son obligatorios.');
      return;
    }
    if (!this.email().trim() || emailFormatError(this.email())) {
      this.errorMessage.set('Correo institucional inválido.');
      return;
    }
    if (this.phone() && phoneNineDigits(this.phone())) {
      this.errorMessage.set(phoneNineDigits(this.phone()));
      return;
    }
    if (!this.estudianteId()) {
      this.errorMessage.set('Seleccione el estudiante asociado.');
      return;
    }
    if (this.saving()) return;

    this.saving.set(true);
    this.parentService
      .crear({
        nombres: this.firstName().trim(),
        apellidos: this.lastName().trim(),
        correo_institucional: this.email().trim(),
        telefono: this.phone().trim() || undefined,
        estudiante_id: this.estudianteId(),
        parentesco: this.parentesco(),
        es_principal: this.esPrincipal(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Apoderado registrado y vinculado correctamente.');
          this.catalogService.invalidate();
          this.loadParents();
          this.firstName.set('');
          this.lastName.set('');
          this.email.set('');
          this.phone.set('');
          this.estudianteId.set('');
          this.submitted.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.detail ?? 'No se pudo guardar el apoderado. Verifique que el correo no esté duplicado.');
        },
      });
  }
}
