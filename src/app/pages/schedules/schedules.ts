import { Component, computed, inject } from '@angular/core';
import { DataTable } from '../../components/data-table/data-table';
import { DataTableColumn, DataTableRow } from '../../components/data-table/data-table.model';
import { ScheduleService } from '../../services/schedule.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-schedules',
  imports: [DataTable],
  templateUrl: './schedules.html',
  styleUrl: './schedules.scss',
})
export class Schedules {
  private readonly scheduleService = inject(ScheduleService);
  protected readonly roleContext = inject(RoleContextService);

  protected readonly weeklySchedule = computed(() => this.roleContext.getWeeklySchedule());

  protected readonly institutionalColumns: DataTableColumn[] = [
    { key: 'dia', label: 'Día' },
    { key: 'hora', label: 'Hora' },
    { key: 'curso', label: 'Curso' },
    { key: 'docente', label: 'Docente' },
    { key: 'aula', label: 'Aula' },
    { key: 'nivel', label: 'Nivel' },
  ];

  protected readonly teacherColumns: DataTableColumn[] = [
    { key: 'dia', label: 'Día' },
    { key: 'hora', label: 'Hora' },
    { key: 'curso', label: 'Curso' },
    { key: 'grado', label: 'Grado' },
    { key: 'aula', label: 'Aula' },
  ];

  protected readonly institutionalRows: DataTableRow[] = this.scheduleService.getAll().map((s) => ({
    dia: s.day,
    hora: s.time,
    curso: s.course,
    docente: s.teacherName,
    aula: s.classroom,
    nivel: 'Secundaria',
  }));

  protected readonly teacherRows: DataTableRow[] = [
    { dia: 'Lunes', hora: '08:00 - 09:30', curso: 'Matemática', grado: '2° A', aula: 'A-201' },
    { dia: 'Lunes', hora: '09:45 - 11:15', curso: 'Matemática', grado: '3° A', aula: 'A-201' },
    { dia: 'Martes', hora: '10:30 - 12:00', curso: 'Comunicación', grado: '3° B', aula: 'B-102' },
    { dia: 'Jueves', hora: '08:00 - 09:30', curso: 'Matemática', grado: '2° A', aula: 'A-201' },
  ];
}
