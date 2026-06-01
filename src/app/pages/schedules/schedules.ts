import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoleContextService } from '../../services/role-context.service';

export type ScheduleBlockType = 'math' | 'technology' | 'ethics' | 'project' | 'evaluation' | 'general';

export interface ScheduleWeekBlock {
  day: string;
  slotId: string;
  course: string;
  room: string;
  type: ScheduleBlockType;
}

export interface ScheduleTimeSlot {
  id: string;
  label: string;
  isBreak?: boolean;
}

export interface ScheduleWeekDay {
  key: string;
  label: string;
  dateLabel: string;
}

export interface NextClassInfo {
  label: string;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-schedules',
  imports: [RouterLink, NgClass],
  templateUrl: './schedules.html',
  styleUrl: './schedules.scss',
})
export class Schedules {
  protected readonly roleContext = inject(RoleContextService);

  protected readonly weekDays: ScheduleWeekDay[] = [
    { key: 'lunes', label: 'Lunes', dateLabel: '18 MAY' },
    { key: 'martes', label: 'Martes', dateLabel: '19 MAY' },
    { key: 'miercoles', label: 'Miércoles', dateLabel: '20 MAY' },
    { key: 'jueves', label: 'Jueves', dateLabel: '21 MAY' },
    { key: 'viernes', label: 'Viernes', dateLabel: '22 MAY' },
  ];

  protected readonly timeSlots: ScheduleTimeSlot[] = [
    { id: '07', label: '07:00 AM' },
    { id: '09', label: '09:00 AM' },
    { id: 'recess', label: 'RECESO', isBreak: true },
    { id: '12', label: '12:00 PM' },
    { id: '14', label: '02:00 PM' },
  ];

  protected readonly pageTitle = computed(() => {
    if (this.roleContext.isStudent()) {
      return 'Mi Horario de Clases';
    }
    if (this.roleContext.isParent()) {
      return 'Horario del Estudiante';
    }
    if (this.roleContext.isTeacher()) {
      return 'Mi Horario Docente';
    }
    return 'Horario Institucional';
  });

  protected readonly pageSubtitle = computed(() => {
    if (this.roleContext.isStudent()) {
      return 'Semana académica del estudiante.';
    }
    if (this.roleContext.isParent()) {
      return 'Consulta semanal del horario académico del estudiante asociado.';
    }
    if (this.roleContext.isTeacher()) {
      return 'Clases asignadas para la semana académica.';
    }
    return 'Vista general de horarios académicos por nivel y aula.';
  });

  protected readonly weekRangeLabel = 'Semana del 18 al 22 de Mayo — Semestre 2024';

  protected readonly studentLabel = computed(() => {
    const s = this.roleContext.linkedStudent;
    return `${s.fullName} · ${s.grade} ${s.level} ${s.section}`;
  });

  protected readonly nextClass = computed((): NextClassInfo => {
    if (this.roleContext.isInstitutional()) {
      return {
        label: 'Próxima actividad',
        title: 'Reunión académica',
        detail: 'Sala de Dirección · 10:30 AM',
      };
    }
    if (this.roleContext.isTeacher()) {
      return {
        label: 'Próxima clase',
        title: 'Cálculo Diferencial',
        detail: 'Aula 402B · En 15 min',
      };
    }
    return {
      label: 'Próxima clase',
      title: 'Sistemas Operativos',
      detail: 'Lab de Software 1 · 09:00 AM',
    };
  });

  protected readonly scheduleBlocks = computed(() => {
    if (this.roleContext.isStudent() || this.roleContext.isParent()) {
      return this.buildStudentBlocks();
    }
    if (this.roleContext.isTeacher()) {
      return this.teacherBlocks;
    }
    return this.institutionalBlocks;
  });

  private readonly institutionalBlocks: ScheduleWeekBlock[] = [
    { day: 'Lunes', slotId: '09', course: 'Sistemas Operativos', room: 'Lab de Software 1', type: 'technology' },
    { day: 'Lunes', slotId: '14', course: 'Proyecto Integrador', room: 'Aula Taller 2', type: 'project' },
    { day: 'Martes', slotId: '09', course: 'Cálculo Diferencial', room: 'Aula 402B', type: 'math' },
    { day: 'Martes', slotId: '12', course: 'Seminario de Ética', room: 'Sala Magna', type: 'ethics' },
    { day: 'Miércoles', slotId: '07', course: 'Matemática Avanzada', room: 'Aula 301', type: 'math' },
    { day: 'Miércoles', slotId: '14', course: 'Tecnología Educativa', room: 'Lab 2', type: 'technology' },
    { day: 'Jueves', slotId: '09', course: 'Comunicación Institucional', room: 'Aula B-102', type: 'general' },
    { day: 'Jueves', slotId: '12', course: 'Evaluación Formativa', room: 'Aula 205', type: 'evaluation' },
    { day: 'Viernes', slotId: '09', course: 'Proyecto Integrador', room: 'Aula Taller 2', type: 'project' },
    { day: 'Viernes', slotId: '14', course: 'Formación en Valores', room: 'Sala Magna', type: 'ethics' },
  ];

  private readonly teacherBlocks: ScheduleWeekBlock[] = [
    { day: 'Lunes', slotId: '09', course: 'Cálculo Diferencial', room: 'Aula 402B', type: 'math' },
    { day: 'Lunes', slotId: '12', course: 'Matemática', room: 'A-201', type: 'math' },
    { day: 'Martes', slotId: '09', course: 'Matemática', room: 'A-201', type: 'math' },
    { day: 'Miércoles', slotId: '14', course: 'Comunicación', room: 'B-102', type: 'general' },
    { day: 'Jueves', slotId: '09', course: 'Cálculo Diferencial', room: 'Aula 402B', type: 'math' },
    { day: 'Viernes', slotId: '12', course: 'Tutoría académica', room: 'Sala docentes', type: 'general' },
  ];

  protected getBlock(dayLabel: string, slotId: string): ScheduleWeekBlock | undefined {
    return this.scheduleBlocks().find((block) => block.day === dayLabel && block.slotId === slotId);
  }

  private buildStudentBlocks(): ScheduleWeekBlock[] {
    const typeByCourse: Record<string, ScheduleBlockType> = {
      Matemática: 'math',
      Comunicación: 'ethics',
      'Ciencia y Tecnología': 'technology',
      Historia: 'general',
      Inglés: 'technology',
      'Educación Física': 'project',
    };

    const slotByTime: Record<string, string> = {
      '08:00 - 09:30': '09',
      '09:45 - 11:15': '12',
      '10:30 - 12:00': '12',
    };

    return this.roleContext.getWeeklySchedule().flatMap((day) =>
      day.blocks.map((block) => ({
        day: day.day,
        slotId: slotByTime[block.time] ?? '09',
        course: block.course,
        room: block.room,
        type: typeByCourse[block.course] ?? 'general',
      })),
    );
  }
}
