import { Injectable } from '@angular/core';
import { ParentTracking } from '../interfaces/parent-tracking';

@Injectable({
  providedIn: 'root',
})
export class ParentTrackingService {
  private readonly records: ParentTracking[] = [
    {
      id: 1,
      studentName: 'Lucía Torres',
      parentName: 'María Torres',
      lastCommunication: '25 May 2026',
      academicStatus: 'Bueno',
      observation: 'Buen rendimiento general en el bimestre.',
    },
    {
      id: 2,
      studentName: 'Mateo Rojas',
      parentName: 'Jorge Rojas',
      lastCommunication: '22 May 2026',
      academicStatus: 'Regular',
      observation: 'Reforzar tareas de matemática en casa.',
    },
    {
      id: 3,
      studentName: 'Valeria Quispe',
      parentName: 'Patricia Quispe',
      lastCommunication: '20 May 2026',
      academicStatus: 'Bueno',
      observation: 'Participación activa en clase de historia.',
    },
    {
      id: 4,
      studentName: 'Diego Fernández',
      parentName: 'Ricardo Fernández',
      lastCommunication: '18 May 2026',
      academicStatus: 'En observación',
      observation: 'Seguimiento por inasistencias recientes.',
    },
    {
      id: 5,
      studentName: 'Camila Salazar',
      parentName: 'Claudia Salazar',
      lastCommunication: '15 May 2026',
      academicStatus: 'Bueno',
      observation: 'Entrega puntual de tareas en inglés.',
    },
  ];

  getAll(): ParentTracking[] {
    return [...this.records];
  }

  getById(id: number): ParentTracking | undefined {
    return this.records.find((record) => record.id === id);
  }
}
