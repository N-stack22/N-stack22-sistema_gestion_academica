import { Injectable } from '@angular/core';
import { Parent } from '../interfaces/parent';

@Injectable({
  providedIn: 'root',
})
export class ParentService {
  private readonly parents: Parent[] = [
    {
      id: 1,
      fullName: 'María Torres',
      studentName: 'Lucía Torres',
      relationship: 'Madre',
      phone: '987 654 321',
      email: 'mtorres@email.com',
    },
    {
      id: 2,
      fullName: 'Jorge Rojas',
      studentName: 'Mateo Rojas',
      relationship: 'Padre',
      phone: '912 345 678',
      email: 'jrojas@email.com',
    },
    {
      id: 3,
      fullName: 'Patricia Quispe',
      studentName: 'Valeria Quispe',
      relationship: 'Madre',
      phone: '934 567 890',
      email: 'pquispe@email.com',
    },
    {
      id: 4,
      fullName: 'Ricardo Fernández',
      studentName: 'Diego Fernández',
      relationship: 'Padre',
      phone: '956 789 012',
      email: 'rfernandez@email.com',
    },
    {
      id: 5,
      fullName: 'Claudia Salazar',
      studentName: 'Camila Salazar',
      relationship: 'Madre',
      phone: '923 456 789',
      email: 'csalazar@email.com',
    },
  ];

  getAll(): Parent[] {
    return [...this.parents];
  }

  getById(id: number): Parent | undefined {
    return this.parents.find((parent) => parent.id === id);
  }
}
