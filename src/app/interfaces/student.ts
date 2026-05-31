export interface Student {
  id: number;
  code: string;
  fullName: string;
  level: 'Inicial' | 'Primaria' | 'Secundaria';
  grade: string;
  section: string;
  status: 'Activo' | 'Inactivo';
}
