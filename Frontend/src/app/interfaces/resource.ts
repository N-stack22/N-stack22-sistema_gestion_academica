export interface Resource {
  id: string;
  title: string;
  courseId?: string;
  course: string;
  courseLabel?: string;
  type: string;
  typeCode?: string;
  date: string;
  active?: boolean;
  statusCode?: string;
  status: string;
  description?: string;
  fileUrl?: string;
  fileStorageRef?: string;
  fileName?: string;
}
