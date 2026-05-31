export interface Course {
  id: number;
  code: string;
  name: string;
  level: 'Inicial' | 'Primaria' | 'Secundaria';
  grade: string;
  teacherName: string;
  status: 'Activo' | 'Inactivo';
}
