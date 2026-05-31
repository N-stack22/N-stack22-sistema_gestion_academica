import { Injectable } from '@angular/core';
import { Schedule } from '../interfaces/schedule';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly schedules: Schedule[] = [
    {
      id: 1,
      day: 'Lunes',
      time: '08:00 - 09:30',
      course: 'Matemática',
      teacherName: 'Prof. Carlos García',
      classroom: 'A-201',
    },
    {
      id: 2,
      day: 'Lunes',
      time: '09:45 - 11:15',
      course: 'Comunicación',
      teacherName: 'Prof. Rosa López',
      classroom: 'B-102',
    },
    {
      id: 3,
      day: 'Martes',
      time: '08:00 - 09:30',
      course: 'Ciencia y Tecnología',
      teacherName: 'Prof. Miguel Mendoza',
      classroom: 'Lab-1',
    },
    {
      id: 4,
      day: 'Miércoles',
      time: '10:30 - 12:00',
      course: 'Historia',
      teacherName: 'Prof. Elena Ríos',
      classroom: 'C-305',
    },
    {
      id: 5,
      day: 'Jueves',
      time: '08:00 - 09:30',
      course: 'Inglés',
      teacherName: 'Prof. Andrés Vargas',
      classroom: 'A-104',
    },
  ];

  getAll(): Schedule[] {
    return [...this.schedules];
  }

  getById(id: number): Schedule | undefined {
    return this.schedules.find((schedule) => schedule.id === id);
  }
}
