export interface Task {
  id: string;
  title: string;
  course: string;
  courseId?: string;
  section?: string;
  teacher?: string;
  dueDate: string;
  status: string;
  statusCode?: string;
  description?: string;
  attachmentUrl?: string;
  publishedAt?: string;
  submitted?: boolean;
  deliveryStatus?: string;
  deliveryStatusCode?: string;
  deliveryId?: string;
  deliveryGrade?: string;
  deliveryFeedback?: string;
  deliveryFileUrl?: string;
  deliverySubmittedAt?: string;
  overdue?: boolean;
}

export interface TaskSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  status: string;
  statusCode: string;
  submitted: boolean;
  grade: string;
  submittedAt: string;
  fileUrl: string;
  feedback: string;
  description?: string;
}
