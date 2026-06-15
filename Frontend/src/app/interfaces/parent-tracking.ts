export interface ParentTracking {
  id: number;
  studentName: string;
  parentName: string;
  lastCommunication: string;
  academicStatus: 'Bueno' | 'Regular' | 'En observación';
  observation: string;
}
