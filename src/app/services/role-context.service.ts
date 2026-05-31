import { Injectable, inject } from '@angular/core';
import { DataTableRow } from '../components/data-table/data-table.model';
import { StudentContext } from '../interfaces/student-context';
import { Role } from '../interfaces/role';
import { AuthService } from './auth.service';

export type ViewMode = 'institutional' | 'teacher' | 'student' | 'parent';

export interface FamilyProfile {
  guardianName: string;
  relationship: string;
  phone: string;
  email: string;
  student: StudentContext;
  academicStatus: string;
  lastCommunication: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoleContextService {
  private readonly auth = inject(AuthService);

  readonly linkedStudent: StudentContext = {
    fullName: 'Lucía Torres',
    level: 'Secundaria',
    grade: '2°',
    section: 'A',
    code: 'EST-001',
  };

  getViewMode(): ViewMode {
    const role = this.auth.currentUser()?.role;
    switch (role) {
      case 'ADMIN':
      case 'DIRECTOR':
        return 'institutional';
      case 'TEACHER':
        return 'teacher';
      case 'STUDENT':
        return 'student';
      case 'PARENT':
        return 'parent';
      default:
        return 'institutional';
    }
  }

  isInstitutional(): boolean {
    return this.hasRole('ADMIN', 'DIRECTOR');
  }

  isTeacher(): boolean {
    return this.hasRole('TEACHER');
  }

  isStudent(): boolean {
    return this.hasRole('STUDENT');
  }

  isParent(): boolean {
    return this.hasRole('PARENT');
  }

  canRegisterStudents(): boolean {
    return this.isInstitutional();
  }

  canRegisterTeachers(): boolean {
    return this.isInstitutional();
  }

  canRegisterCourses(): boolean {
    return this.isInstitutional();
  }

  canRegisterTasks(): boolean {
    return this.isInstitutional() || this.isTeacher();
  }

  canRegisterResources(): boolean {
    return this.isInstitutional() || this.isTeacher();
  }

  getActiveStudent(): StudentContext | null {
    if (this.isStudent() || this.isParent()) {
      return this.linkedStudent;
    }
    return null;
  }

  getFamilyProfile(): FamilyProfile | null {
    if (!this.isParent()) {
      return null;
    }

    const user = this.auth.currentUser();
    return {
      guardianName: user?.fullName ?? 'Rosa Quispe',
      relationship: 'Madre',
      phone: '987 654 321',
      email: user?.email ?? 'padre@horizonte.edu.pe',
      student: this.linkedStudent,
      academicStatus: 'Bueno',
      lastCommunication: '25 May 2026',
    };
  }

  getStudentGrades(): DataTableRow[] {
    return [
      { curso: 'Matemática', bimestre: 'I Bimestre', nota: '16', estado: 'Aprobado' },
      { curso: 'Comunicación', bimestre: 'I Bimestre', nota: '15', estado: 'Aprobado' },
      { curso: 'Ciencia y Tecnología', bimestre: 'I Bimestre', nota: '14', estado: 'Aprobado' },
      { curso: 'Historia', bimestre: 'I Bimestre', nota: '17', estado: 'Aprobado' },
      { curso: 'Inglés', bimestre: 'I Bimestre', nota: '15', estado: 'Aprobado' },
    ];
  }

  getTeacherGrades(): DataTableRow[] {
    return [
      { curso: 'Matemática — 2° A', bimestre: 'I Bimestre', nota: '—', estado: 'En registro' },
      { curso: 'Matemática — 3° A', bimestre: 'I Bimestre', nota: '—', estado: 'En registro' },
      { curso: 'Comunicación — 3° B', bimestre: 'I Bimestre', nota: '—', estado: 'Pendiente' },
    ];
  }

  getStudentTasks(): DataTableRow[] {
    return [
      { tarea: 'Ejercicios de fracciones', curso: 'Matemática', fecha: '18 Mar 2026', estado: 'Pendiente' },
      { tarea: 'Ensayo argumentativo', curso: 'Comunicación', fecha: '20 Mar 2026', estado: 'En revisión' },
      { tarea: 'Informe de laboratorio', curso: 'Ciencia y Tecnología', fecha: '22 Mar 2026', estado: 'Pendiente' },
    ];
  }

  getTeacherTasks(): DataTableRow[] {
    return [
      { tarea: 'Revisar ensayo — Lucía Torres', curso: 'Comunicación', fecha: '20 Mar 2026', estado: 'En revisión' },
      { tarea: 'Calificar fracciones — 2° A', curso: 'Matemática', fecha: '18 Mar 2026', estado: 'Pendiente' },
      { tarea: 'Publicar guía bimestral', curso: 'Matemática', fecha: '15 Mar 2026', estado: 'Completada' },
    ];
  }

  getStudentAttendance(): DataTableRow[] {
    return [
      { fecha: '28 May 2026', curso: 'Matemática', estado: 'Presente' },
      { fecha: '28 May 2026', curso: 'Comunicación', estado: 'Presente' },
      { fecha: '27 May 2026', curso: 'Historia', estado: 'Presente' },
      { fecha: '26 May 2026', curso: 'Inglés', estado: 'Tarde' },
    ];
  }

  getTeacherAttendance(): DataTableRow[] {
    return [
      { fecha: '28 May 2026', estudiante: 'Lucía Torres', curso: 'Matemática', estado: 'Presente' },
      { fecha: '28 May 2026', estudiante: 'Mateo Rojas', curso: 'Matemática', estado: 'Presente' },
      { fecha: '28 May 2026', estudiante: 'Camila Salazar', curso: 'Comunicación', estado: 'Tarde' },
    ];
  }

  getStudentResources(): DataTableRow[] {
    return [
      { recurso: 'Guía de álgebra básica', curso: 'Matemática', tipo: 'PDF', estado: 'Disponible' },
      { recurso: 'Video: comprensión lectora', curso: 'Comunicación', tipo: 'Video', estado: 'Disponible' },
      { recurso: 'Fichas de vocabulario A1', curso: 'Inglés', tipo: 'PDF', estado: 'Disponible' },
    ];
  }

  getTeacherResources(): DataTableRow[] {
    return [
      { recurso: 'Guía de fracciones', curso: 'Matemática', tipo: 'PDF', estado: 'Publicado' },
      { recurso: 'Rúbrica de ensayo', curso: 'Comunicación', tipo: 'Guía', estado: 'Publicado' },
      { recurso: 'Presentación geometría', curso: 'Matemática', tipo: 'Enlace', estado: 'Publicado' },
    ];
  }

  getStudentPensions(): DataTableRow[] {
    return [
      {
        mes: 'Marzo 2026',
        concepto: 'Pensión escolar',
        monto: 'S/ 450',
        estado: 'Pagada',
        vencimiento: '10 Mar 2026',
      },
      {
        mes: 'Abril 2026',
        concepto: 'Pensión escolar',
        monto: 'S/ 450',
        estado: 'Pendiente',
        vencimiento: '10 Abr 2026',
      },
      {
        mes: 'Febrero 2026',
        concepto: 'Pensión escolar',
        monto: 'S/ 450',
        estado: 'Pagada',
        vencimiento: '10 Feb 2026',
      },
    ];
  }

  getStudentPayments(): DataTableRow[] {
    return [
      {
        codigo: 'PAG-101',
        concepto: 'Pensión marzo 2026',
        monto: 'S/ 450',
        estado: 'Registrado',
        fecha: '05 Mar 2026',
      },
      {
        codigo: 'PAG-102',
        concepto: 'Matrícula 2026',
        monto: 'S/ 350',
        estado: 'Registrado',
        fecha: '02 Mar 2026',
      },
      {
        codigo: 'PAG-103',
        concepto: 'Pensión abril 2026',
        monto: 'S/ 450',
        estado: 'Pendiente',
        fecha: '—',
      },
    ];
  }

  getWeeklySchedule(): { day: string; blocks: { time: string; course: string; teacher: string; room: string }[] }[] {
    return [
      {
        day: 'Lunes',
        blocks: [
          { time: '08:00 - 09:30', course: 'Matemática', teacher: 'Prof. Carlos García', room: 'A-201' },
          { time: '09:45 - 11:15', course: 'Comunicación', teacher: 'Prof. Rosa López', room: 'B-102' },
        ],
      },
      {
        day: 'Martes',
        blocks: [
          { time: '08:00 - 09:30', course: 'Ciencia y Tecnología', teacher: 'Prof. Miguel Mendoza', room: 'Lab-1' },
        ],
      },
      {
        day: 'Miércoles',
        blocks: [
          { time: '10:30 - 12:00', course: 'Historia', teacher: 'Prof. Elena Ríos', room: 'C-305' },
        ],
      },
      {
        day: 'Jueves',
        blocks: [
          { time: '08:00 - 09:30', course: 'Inglés', teacher: 'Prof. Andrés Vargas', room: 'A-104' },
        ],
      },
      {
        day: 'Viernes',
        blocks: [
          { time: '08:00 - 09:30', course: 'Educación Física', teacher: 'Prof. Luis Vega', room: 'Cancha' },
        ],
      },
    ];
  }

  private hasRole(...roles: Role[]): boolean {
    const role = this.auth.currentUser()?.role;
    return role ? roles.includes(role) : false;
  }
}
