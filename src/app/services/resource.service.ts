import { Injectable } from '@angular/core';
import { Resource } from '../interfaces/resource';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly resources: Resource[] = [
    {
      id: 1,
      title: 'Guía de álgebra básica',
      course: 'Matemática',
      type: 'PDF',
      date: '05 Mar 2026',
      status: 'Disponible',
    },
    {
      id: 2,
      title: 'Video: comprensión lectora',
      course: 'Comunicación',
      type: 'Video',
      date: '08 Mar 2026',
      status: 'Disponible',
    },
    {
      id: 3,
      title: 'Manual de experimentos',
      course: 'Ciencia y Tecnología',
      type: 'Guía',
      date: '10 Mar 2026',
      status: 'Disponible',
    },
    {
      id: 4,
      title: 'Mapa interactivo del Perú',
      course: 'Historia',
      type: 'Enlace',
      date: '12 Mar 2026',
      status: 'Disponible',
    },
    {
      id: 5,
      title: 'Fichas de vocabulario A1',
      course: 'Inglés',
      type: 'PDF',
      date: '14 Mar 2026',
      status: 'Archivado',
    },
  ];

  getAll(): Resource[] {
    return [...this.resources];
  }

  getById(id: number): Resource | undefined {
    return this.resources.find((resource) => resource.id === id);
  }
}
