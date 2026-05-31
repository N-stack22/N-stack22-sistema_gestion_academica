import { Component, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AcademicUserService } from '../../services/academic-user.service';

@Component({
  selector: 'app-users',
  imports: [DataTable],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly academicUserService = inject(AcademicUserService);

  protected readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'correo', label: 'Correo' },
    { key: 'rol', label: 'Rol' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly rows: DataTableRow[] = this.academicUserService.getAll().map((user) => ({
    nombre: user.fullName,
    correo: user.email,
    rol: user.role,
    estado: user.status,
  }));
}
