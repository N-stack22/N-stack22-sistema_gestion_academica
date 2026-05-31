import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { GradeService } from '../../services/grade.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-grades',
  imports: [DataTable],
  templateUrl: './grades.html',
  styleUrl: './grades.scss',
})
export class Grades {
  private readonly gradeService = inject(GradeService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly columns: DataTableColumn[] = [
    { key: 'curso', label: 'Curso' },
    { key: 'bimestre', label: 'Bimestre' },
    { key: 'nota', label: 'Nota' },
    { key: 'estado', label: 'Estado' },
  ];

  protected readonly adminRows: DataTableRow[] = this.gradeService.getAll().map((grade) => ({
    curso: grade.course,
    bimestre: grade.bimester,
    nota: grade.score === 0 ? '—' : String(grade.score),
    estado: grade.status,
  }));

  protected readonly rows = computed(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return this.roleContext.getStudentGrades();
    }
    if (this.roleContext.isTeacher()) {
      return this.roleContext.getTeacherGrades();
    }
    return this.adminRows;
  });
}
