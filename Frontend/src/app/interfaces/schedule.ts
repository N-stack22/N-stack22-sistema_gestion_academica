export interface Schedule {
  id?: string;
  courseId?: string;
  sectionId?: string;
  gradeId?: string;
  levelId?: string;
  level?: string;
  academicYearId?: string;
  day: string;
  dayOrder?: number;
  time?: string;
  startTime?: string;
  endTime?: string;
  course: string;
  teacher?: string;
  teacherName?: string;
  section?: string;
  classroom: string;
}
