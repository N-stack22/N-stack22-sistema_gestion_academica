import { Component, inject, OnInit, signal } from '@angular/core';
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

  protected readonly roleFilter = signal('');
  protected readonly rows = signal<DataTableRow[]>([]);
  protected readonly selectedUser = signal<AcademicUser | null>(null);
  protected readonly roles = signal<{ codigo: string; nombre: string }[]>([]);
  protected readonly showForm = signal(false);
  protected readonly nombres = signal('');
  protected readonly apellidos = signal('');
  protected readonly correo = signal('');
  protected readonly rolCodigo = signal('ADMIN');
  protected readonly password = signal('Admin123');
  protected readonly successMessage = signal('');

  protected readonly columns: DataTableColumn[] = [
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

  protected loadUsers(): void {
    const rol = this.roleFilter() || undefined;
    this.academicUserService.listar(rol).subscribe({
      next: (users) => {
        this.rows.set(
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

  protected onRoleFilterChange(value: string): void {
    this.roleFilter.set(value);
    this.loadUsers();
  }

  protected onDetail(row: DataTableRow): void {
    const id = row['_id'];
    if (!id) return;
    this.academicUserService.obtener(id).subscribe({
      next: (user) => this.selectedUser.set(user),
    });
  }

  protected toggleStatus(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.academicUserService
      .actualizar(user.id, { estado: !user.active })
      .subscribe({
        next: (updated) => {
          this.selectedUser.set(updated);
          this.loadUsers();
        },
      });
  }

  protected registrarUsuario(): void {
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
          this.loadUsers();
        },
      });
  }
}
