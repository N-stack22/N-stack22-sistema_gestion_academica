export interface Course {
  id: string;
  name: string;
  subjectCode?: string;
  teacherId?: string;
  teacherName: string;
  teacherCode?: string;
  section: string;
  sectionRoom?: string;
  grade: string;
  level: string;
  academicYear: string;
  label?: string;
  scheduleCount?: number;
}
