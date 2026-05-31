import { Injectable } from '@angular/core';
import { Student } from '../interfaces/student';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly students: Student[] = [
    {
      id: 1,
      code: 'EST-001',
      fullName: 'Lucía Torres',
      level: 'Secundaria',
      grade: '3°',
      section: 'A',
      status: 'Activo',
    },
    {
      id: 2,
      code: 'EST-002',
      fullName: 'Mateo Rojas',
      level: 'Secundaria',
      grade: '3°',
      section: 'A',
      status: 'Activo',
    },
    {
      id: 3,
      code: 'EST-003',
      fullName: 'Valeria Quispe',
      level: 'Primaria',
      grade: '5°',
      section: 'B',
      status: 'Activo',
    },
    {
      id: 4,
      code: 'EST-004',
      fullName: 'Diego Fernández',
      level: 'Inicial',
      grade: '5 años',
      section: 'C',
      status: 'Activo',
    },
    {
      id: 5,
      code: 'EST-005',
      fullName: 'Camila Salazar',
      level: 'Secundaria',
      grade: '2°',
      section: 'B',
      status: 'Activo',
    },
  ];

  getAll(): Student[] {
    return [...this.students];
  }

  getById(id: number): Student | undefined {
    return this.students.find((student) => student.id === id);
  }
}
