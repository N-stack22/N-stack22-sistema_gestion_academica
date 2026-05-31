import { Injectable } from '@angular/core';
import { AcademicUser } from '../interfaces/academic-user';

@Injectable({
  providedIn: 'root',
})
export class AcademicUserService {
  private readonly users: AcademicUser[] = [
    {
      id: 1,
      fullName: 'Administrador Horizonte',
      email: 'admin@horizonte.edu.pe',
      role: 'ADMIN',
      status: 'Activo',
    },
    {
      id: 2,
      fullName: 'Director Académico',
      email: 'director@horizonte.edu.pe',
      role: 'DIRECTOR',
      status: 'Activo',
    },
    {
      id: 3,
      fullName: 'Prof. Carlos García',
      email: 'garcia@horizonte.edu.pe',
      role: 'TEACHER',
      status: 'Activo',
    },
    {
      id: 4,
      fullName: 'Lucía Torres',
      email: 'lucia.torres@horizonte.edu.pe',
      role: 'STUDENT',
      status: 'Activo',
    },
    {
      id: 5,
      fullName: 'María Torres',
      email: 'mtorres@email.com',
      role: 'PARENT',
      status: 'Activo',
    },
  ];

  getAll(): AcademicUser[] {
    return [...this.users];
  }

  getById(id: number): AcademicUser | undefined {
    return this.users.find((user) => user.id === id);
  }
}
