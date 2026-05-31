export interface Attendance {
  id: number;
  date: string;
  studentName: string;
  course: string;
  status: 'Presente' | 'Tarde' | 'Falta justificada' | 'Falta';
}
