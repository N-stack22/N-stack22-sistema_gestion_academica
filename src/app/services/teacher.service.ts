import { Injectable } from '@angular/core';
import { Teacher } from '../interfaces/teacher';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private readonly teachers: Teacher[] = [
    {
      id: 1,
      code: 'DOC-001',
      fullName: 'Prof. Carlos García',
      specialty: 'Matemática',
      email: 'garcia@horizonte.edu.pe',
      status: 'Activo',
    },
    {
      id: 2,
      code: 'DOC-002',
      fullName: 'Prof. Rosa López',
      specialty: 'Comunicación',
      email: 'lopez@horizonte.edu.pe',
      status: 'Activo',
    },
    {
      id: 3,
      code: 'DOC-003',
      fullName: 'Prof. Miguel Mendoza',
      specialty: 'Ciencia y Tecnología',
      email: 'mendoza@horizonte.edu.pe',
      status: 'Activo',
    },
    {
      id: 4,
      code: 'DOC-004',
      fullName: 'Prof. Elena Ríos',
      specialty: 'Historia',
      email: 'rios@horizonte.edu.pe',
      status: 'Activo',
    },
    {
      id: 5,
      code: 'DOC-005',
      fullName: 'Prof. Andrés Vargas',
      specialty: 'Inglés',
      email: 'vargas@horizonte.edu.pe',
      status: 'Activo',
    },
  ];

  getAll(): Teacher[] {
    return [...this.teachers];
  }

  getById(id: number): Teacher | undefined {
    return this.teachers.find((teacher) => teacher.id === id);
  }
}
