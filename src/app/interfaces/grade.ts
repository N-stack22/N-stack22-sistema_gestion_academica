export interface Grade {
  id: number;
  course: string;
  bimester: string;
  score: number;
  status: 'Aprobado' | 'En riesgo' | 'Pendiente';
}
