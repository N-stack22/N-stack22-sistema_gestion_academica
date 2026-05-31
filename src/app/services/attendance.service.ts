import { Injectable } from '@angular/core';
import { Attendance } from '../interfaces/attendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly records: Attendance[] = [
    {
      id: 1,
      date: '28 May 2026',
      studentName: 'Lucía Torres',
      course: 'Matemática',
      status: 'Presente',
    },
    {
      id: 2,
      date: '28 May 2026',
      studentName: 'Mateo Rojas',
      course: 'Comunicación',
      status: 'Tarde',
    },
    {
      id: 3,
      date: '27 May 2026',
      studentName: 'Valeria Quispe',
      course: 'Historia',
      status: 'Falta justificada',
    },
    {
      id: 4,
      date: '27 May 2026',
      studentName: 'Diego Fernández',
      course: 'Ciencia y Tecnología',
      status: 'Falta',
    },
    {
      id: 5,
      date: '26 May 2026',
      studentName: 'Camila Salazar',
      course: 'Inglés',
      status: 'Presente',
    },
  ];

  getAll(): Attendance[] {
    return [...this.records];
  }

  getById(id: number): Attendance | undefined {
    return this.records.find((record) => record.id === id);
  }
}
