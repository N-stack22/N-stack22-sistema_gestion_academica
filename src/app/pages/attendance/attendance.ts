import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { AttendanceService } from '../../services/attendance.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-attendance',
  imports: [DataTable],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class Attendance {
  private readonly attendanceService = inject(AttendanceService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly adminColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'estudiante', label: 'Estudiante' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly personalColumns: DataTableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'curso', label: 'Curso' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly columns = computed(() =>
    this.roleContext.isStudent() || this.roleContext.isParent()
      ? this.personalColumns
      : this.adminColumns,
  );

  protected readonly adminRows: DataTableRow[] = this.attendanceService.getAll().map((r) => ({
    fecha: r.date,
    estudiante: r.studentName,
    curso: r.course,
    estado: r.status,
  }));

  protected readonly rows = computed(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return this.roleContext.getStudentAttendance();
    }
    if (this.roleContext.isTeacher()) {
      return this.roleContext.getTeacherAttendance();
    }
    return this.adminRows;
  });
}
