import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AcademicUser, AcademicUserService } from '../../services/academic-user.service';
import { CatalogService } from '../../services/catalog.service';
import { isRequired, emailFormatError } from '../../utils/form-validation';

@Component({
  selector: 'app-users',
  imports: [DataTable],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly academicUserService = inject(AcademicUserService);
  private readonly catalogService = inject(CatalogService);

  public readonly draftRoleFilter = signal('');
  public readonly draftSearchFilter = signal('');
  public readonly roleFilter = signal('');
  public readonly searchFilter = signal('');
  public readonly allRows = signal<DataTableRow[]>([]);
  public readonly rows = computed(() => {
    const q = this.searchFilter().trim().toLowerCase();
    if (!q) return this.allRows();
    return this.allRows().filter((r) => {
      const nombre = String(r['nombre'] ?? '').toLowerCase();
      const correo = String(r['correo'] ?? '').toLowerCase();
      return nombre.includes(q) || correo.includes(q);
    });
  });
  public readonly selectedUser = signal<AcademicUser | null>(null);
  public readonly roles = signal<{ codigo: string; nombre: string }[]>([]);
  public readonly showForm = signal(false);
  public readonly nombres = signal('');
  public readonly apellidos = signal('');
  public readonly correo = signal('');
  public readonly rolCodigo = signal('ADMIN');
  public readonly password = signal('Admin123');
  public readonly successMessage = signal('');

  public readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'correo', label: 'Correo' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
  ];

  ngOnInit(): void {
    this.catalogService.roles().subscribe({
      next: (roles) => this.roles.set(roles as { codigo: string; nombre: string }[]),
    });
    this.loadUsers();
  }

  public loadUsers(): void {
    const rol = this.roleFilter() || undefined;
    this.academicUserService.listar(rol).subscribe({
      next: (users) => {
        this.allRows.set(
          users.map((user) => ({
            _id: user.id,
            nombre: user.fullName,
            correo: user.email,
            rol: user.roleName || user.role,
            estado: user.status,
          })),
        );
      },
    });
  }

  public buscar(): void {
    this.roleFilter.set(this.draftRoleFilter());
    this.searchFilter.set(this.draftSearchFilter().trim());
    this.loadUsers();
  }

  public onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.academicUserService.obtener(id).subscribe({
      next: (user) => this.selectedUser.set(user),
    });
  }

  public toggleStatus(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.academicUserService
      .actualizar(user.id, { estado: !user.active })
      .subscribe({
        next: (updated) => {
          this.selectedUser.set(updated);
          this.catalogService.invalidate();
          this.loadUsers();
        },
      });
  }

  public registrarUsuario(): void {
    if (
      isRequired(this.nombres(), 'Nombres obligatorios.') ||
      isRequired(this.apellidos(), 'Apellidos obligatorios.') ||
      isRequired(this.correo(), 'Correo obligatorio.') ||
      emailFormatError(this.correo())
    ) {
      return;
    }
    this.academicUserService
      .crear({
        nombres: this.nombres().trim(),
        apellidos: this.apellidos().trim(),
        correo_institucional: this.correo().trim(),
        rol_codigo: this.rolCodigo(),
        password: this.password(),
      })
      .subscribe({
        next: () => {
          this.successMessage.set('Usuario registrado correctamente.');
          this.nombres.set('');
          this.apellidos.set('');
          this.correo.set('');
          this.catalogService.invalidate();
          this.loadUsers();
        },
      });
  }
}
