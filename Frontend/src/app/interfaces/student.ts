export interface Student {
  id: string;
  code: string;
  fullName: string;
  level: string;
  grade: string;
  section: string;
  academicYear?: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
  notes?: string;
  enrollmentId?: string;
  enrollmentStatus?: string;
  guardians?: StudentGuardian[];
}

export interface StudentGuardian {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface StudentCreatePayload {
  nombres: string;
  apellidos: string;
  correo_institucional: string;
  dni?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  password?: string;
}

export interface StudentUpdatePayload {
  nombres?: string;
  apellidos?: string;
  correo_institucional?: string;
  dni?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  estado?: boolean;
}
