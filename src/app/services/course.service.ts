import { Injectable } from '@angular/core';
import { Course } from '../interfaces/course';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly courses: Course[] = [
    {
      id: 1,
      code: 'CUR-001',
      name: 'Matemática',
      level: 'Secundaria',
      grade: '3°',
      teacherName: 'Prof. Carlos García',
      status: 'Activo',
    },
    {
      id: 2,
      code: 'CUR-002',
      name: 'Comunicación',
      level: 'Secundaria',
      grade: '3°',
      teacherName: 'Prof. Rosa López',
      status: 'Activo',
    },
    {
      id: 3,
      code: 'CUR-003',
      name: 'Ciencia y Tecnología',
      level: 'Secundaria',
      grade: '3°',
      teacherName: 'Prof. Miguel Mendoza',
      status: 'Activo',
    },
    {
      id: 4,
      code: 'CUR-004',
      name: 'Historia',
      level: 'Secundaria',
      grade: '3°',
      teacherName: 'Prof. Elena Ríos',
      status: 'Activo',
    },
    {
      id: 5,
      code: 'CUR-005',
      name: 'Inglés',
      level: 'Secundaria',
      grade: '2°',
      teacherName: 'Prof. Andrés Vargas',
      status: 'Activo',
    },
  ];

  getAll(): Course[] {
    return [...this.courses];
  }

  getById(id: number): Course | undefined {
    return this.courses.find((course) => course.id === id);
  }
}
