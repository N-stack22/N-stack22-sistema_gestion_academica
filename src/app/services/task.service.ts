import { Injectable } from '@angular/core';
import { Task } from '../interfaces/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasks: Task[] = [
    {
      id: 1,
      title: 'Ejercicios de fracciones',
      course: 'Matemática',
      dueDate: '18 Mar 2026',
      status: 'Pendiente',
    },
    {
      id: 2,
      title: 'Ensayo argumentativo',
      course: 'Comunicación',
      dueDate: '20 Mar 2026',
      status: 'En revisión',
    },
    {
      id: 3,
      title: 'Informe de laboratorio',
      course: 'Ciencia y Tecnología',
      dueDate: '22 Mar 2026',
      status: 'Pendiente',
    },
    {
      id: 4,
      title: 'Línea de tiempo histórica',
      course: 'Historia',
      dueDate: '15 Mar 2026',
      status: 'Completada',
    },
    {
      id: 5,
      title: 'Presentación oral en inglés',
      course: 'Inglés',
      dueDate: '25 Mar 2026',
      status: 'Pendiente',
    },
  ];

  getAll(): Task[] {
    return [...this.tasks];
  }

  getById(id: number): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }
}
