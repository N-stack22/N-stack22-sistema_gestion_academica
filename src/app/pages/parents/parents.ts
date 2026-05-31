import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { ParentService } from '../../services/parent.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-parents',
  imports: [DataTable],
  templateUrl: './parents.html',
  styleUrl: './parents.scss',
})
export class Parents {
  private readonly parentService = inject(ParentService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly familyProfile = computed(() => this.roleContext.getFamilyProfile());

  protected readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Padre o apoderado' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'parentesco', label: 'Parentesco' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly rows: DataTableRow[] = this.parentService.getAll().map((parent) => ({
    nombre: parent.fullName,
    estudiante: parent.studentName,
    parentesco: parent.relationship,
    telefono: parent.phone,
    correo: parent.email,
    estado: 'Activo',
  }));
}
