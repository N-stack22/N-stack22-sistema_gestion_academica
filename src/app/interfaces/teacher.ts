export interface Teacher {
  id: number;
  code: string;
  fullName: string;
  specialty: string;
  email: string;
  status: 'Activo' | 'Inactivo';
}
