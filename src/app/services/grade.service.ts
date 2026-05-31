import { Injectable } from '@angular/core';
import { Grade } from '../interfaces/grade';

@Injectable({
  providedIn: 'root',
})
export class GradeService {
  private readonly grades: Grade[] = [
    { id: 1, course: 'Matemática', bimester: 'I Bimestre', score: 16, status: 'Aprobado' },
    { id: 2, course: 'Comunicación', bimester: 'I Bimestre', score: 15, status: 'Aprobado' },
    { id: 3, course: 'Ciencia y Tecnología', bimester: 'I Bimestre', score: 11, status: 'En riesgo' },
    { id: 4, course: 'Historia', bimester: 'I Bimestre', score: 17, status: 'Aprobado' },
    { id: 5, course: 'Inglés', bimester: 'I Bimestre', score: 0, status: 'Pendiente' },
  ];

  getAll(): Grade[] {
    return [...this.grades];
  }

  getById(id: number): Grade | undefined {
    return this.grades.find((grade) => grade.id === id);
  }
}
