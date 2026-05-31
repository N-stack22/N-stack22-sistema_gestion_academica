export interface Parent {
  id: number;
  fullName: string;
  studentName: string;
  relationship: 'Madre' | 'Padre' | 'Apoderado';
  phone: string;
  email: string;
}
