export interface Task {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: 'Pendiente' | 'En revisión' | 'Completada';
}
