export interface Resource {
  id: number;
  title: string;
  course: string;
  type: 'PDF' | 'Video' | 'Guía' | 'Enlace';
  date: string;
  status: 'Disponible' | 'Archivado';
}
