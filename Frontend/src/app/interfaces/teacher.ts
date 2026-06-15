export interface TeacherCourse {
  id: string;
  subject: string;
  section: string;
  grade: string;
  level: string;
}

export interface Teacher {
  id: string;
  code: string;
  fullName: string;
  specialty: string;
  email: string;
  status: string;
  active?: boolean;
  coursesCount?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dni?: string;
  cargo?: string;
  degree?: string;
  assignedCourses?: TeacherCourse[];
}
