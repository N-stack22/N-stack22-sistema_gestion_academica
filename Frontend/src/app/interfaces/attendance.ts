export interface Attendance {
  id: string;
  date: string;
  studentName: string;
  studentCode?: string;
  studentId?: string;
  courseId?: string;
  course: string;
  section?: string;
  status: string;
  statusCode?: string;
  notes?: string;
}
