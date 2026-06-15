import { Injectable, computed, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { DataTableRow } from '../components/data-table/data-table.model';

import { API_BASE_URL } from '../config/api.config';

import { LinkedStudent } from '../interfaces/linked-student';

import { Role } from '../interfaces/role';

import { AuthService } from './auth.service';



export type ViewMode = 'institutional' | 'teacher' | 'student' | 'parent';

export interface StudentContext {
  fullName: string;
  level?: string;
  grade?: string;
  section?: string;
  code?: string;
}

export interface FamilyProfile {

  guardianName: string;

  relationship: string;

  phone: string;

  email: string;

  student: StudentContext | null;

  students: LinkedStudent[];

  academicStatus: string;

  lastCommunication: string;

}



interface AuthContextResponse {

  user: { id: string; fullName: string; email: string; role: Role };

  student?: StudentContext & { id?: string };

  family?: {

    guardianName: string;

    phone: string;

    email: string;

    relationship: string;

    student: StudentContext & { id?: string };

    students: (StudentContext & { id?: string; relationship?: string; isPrimary?: boolean })[];

  };

  teacher?: { id: string; courses: { id: string; name: string }[] };

}



@Injectable({ providedIn: 'root' })

export class RoleContextService {

  private readonly auth = inject(AuthService);

  private readonly http = inject(HttpClient);



  private readonly studentContext = signal<StudentContext | null>(null);

  private readonly studentId = signal<string | null>(null);

  private readonly familyProfile = signal<FamilyProfile | null>(null);

  private readonly linkedStudents = signal<LinkedStudent[]>([]);

  private readonly teacherId = signal<string | null>(null);

  private readonly teacherCourses = signal<{ id: string; name: string }[]>([]);

  private readonly loaded = signal(false);

  private contextUserId: string | null = null;



  readonly isReady = computed(() => this.isContextReady());

  readonly activeStudentId = computed(() => this.studentId());



  isLoaded(): boolean {

    return this.loaded();

  }



  reset(): void {

    this.studentContext.set(null);

    this.studentId.set(null);

    this.familyProfile.set(null);

    this.linkedStudents.set([]);

    this.teacherId.set(null);

    this.teacherCourses.set([]);

    this.loaded.set(false);

    this.contextUserId = null;

    sessionStorage.removeItem('horizonte-selected-student');

  }



  loadContext(): void {

    const token = this.auth.getAccessToken();

    const userId = this.auth.currentUser()?.id ?? null;

    if (!token || !userId) return;

    if (this.loaded() && this.contextUserId === userId) return;



    this.studentContext.set(null);

    this.studentId.set(null);

    this.familyProfile.set(null);

    this.teacherId.set(null);

    this.teacherCourses.set([]);

    this.loaded.set(false);



    this.http

      .get<AuthContextResponse>(`${API_BASE_URL}/api/auth/context`, {

        headers: { Authorization: `Bearer ${token}` },

      })

      .subscribe({

        next: (ctx) => {

          this.contextUserId = userId;



          if (ctx.student?.id) {

            this.studentId.set(ctx.student.id);

            this.studentContext.set({

              fullName: ctx.student.fullName,

              level: ctx.student.level,

              grade: ctx.student.grade,

              section: ctx.student.section,

              code: ctx.student.code,

            });

          }

          if (ctx.family) {

            const students: LinkedStudent[] = (ctx.family.students ?? [])

              .filter((s) => !!s.id)

              .map((s) => ({
                id: s.id!,
                fullName: s.fullName,
                code: s.code ?? '',
                level: s.level ?? '',
                grade: s.grade ?? '',
                section: s.section ?? '',
                relationship: s.relationship,
                isPrimary: s.isPrimary,
              }));

            this.linkedStudents.set(students);

            const savedId = sessionStorage.getItem('horizonte-selected-student');

            const primary =

              students.find((s) => s.id === savedId) ??

              students.find((s) => s.isPrimary) ??

              students[0] ??

              null;

            const st = primary ?? ctx.family.student;

            this.familyProfile.set({

              guardianName: ctx.family.guardianName,

              relationship: primary?.relationship ?? ctx.family.relationship,

              phone: ctx.family.phone,

              email: ctx.family.email,

              student: st

                ? {

                    fullName: st.fullName,

                    level: st.level,

                    grade: st.grade,

                    section: st.section,

                    code: st.code,

                  }

                : null,

              students,

              academicStatus: 'Consultar seguimiento',

              lastCommunication: '—',

            });

            if (st?.id) {

              this.applySelectedStudent(students.find((s) => s.id === st.id) ?? {

                id: st.id,

                fullName: st.fullName,

                code: st.code,

                level: st.level,

                grade: st.grade,

                section: st.section,

              });

            }

          }

          if (ctx.teacher) {

            this.teacherId.set(ctx.teacher.id);

            this.teacherCourses.set(ctx.teacher.courses ?? []);

          }

          this.loaded.set(true);

        },

        error: () => {

          this.loaded.set(false);

        },

      });

  }



  whenReady(action: () => void, onTimeout?: () => void): void {

    if (this.isContextReady()) {

      action();

      return;

    }

    this.loadContext();

    const deadline = Date.now() + 10000;

    const timer = setInterval(() => {

      if (this.isContextReady()) {

        clearInterval(timer);

        action();

      } else if (Date.now() > deadline) {

        clearInterval(timer);

        onTimeout?.();

      }

    }, 100);

  }



  requiresStudentScope(): boolean {

    return this.isStudent() || this.isParent();

  }



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

      return this.studentContext();

    }

    return null;

  }



  getStudentId(): string | null {

    return this.studentId();

  }



  getFamilyProfile(): FamilyProfile | null {

    return this.isParent() ? this.familyProfile() : null;

  }



  getLinkedStudents(): LinkedStudent[] {

    return this.linkedStudents();

  }



  setSelectedStudentId(studentId: string): void {

    const student = this.linkedStudents().find((s) => s.id === studentId);

    if (!student) return;

    this.applySelectedStudent(student);

    sessionStorage.setItem('horizonte-selected-student', studentId);

    const family = this.familyProfile();

    if (family) {

      this.familyProfile.set({

        ...family,

        student: {

          fullName: student.fullName,

          level: student.level,

          grade: student.grade,

          section: student.section,

          code: student.code,

        },

        relationship: student.relationship ?? family.relationship,

      });

    }

  }



  private applySelectedStudent(student: LinkedStudent): void {

    this.studentId.set(student.id);

    this.studentContext.set({

      fullName: student.fullName,

      level: student.level,

      grade: student.grade,

      section: student.section,

      code: student.code,

    });

  }



  getTeacherId(): string | null {

    return this.teacherId();

  }



  getTeacherCourses(): { id: string; name: string }[] {

    return this.teacherCourses();

  }



  getStudentGrades(): DataTableRow[] {

    return [];

  }



  getTeacherGrades(): DataTableRow[] {

    return [];

  }



  getStudentTasks(): DataTableRow[] {

    return [];

  }



  getTeacherTasks(): DataTableRow[] {

    return [];

  }



  getStudentAttendance(): DataTableRow[] {

    return [];

  }



  getTeacherAttendance(): DataTableRow[] {

    return [];

  }



  getStudentResources(): DataTableRow[] {

    return [];

  }



  getTeacherResources(): DataTableRow[] {

    return [];

  }



  getStudentPensions(): DataTableRow[] {

    return [];

  }



  getStudentPayments(): DataTableRow[] {

    return [];

  }



  getWeeklySchedule(): { day: string; blocks: { time: string; course: string; teacher: string; room: string }[] }[] {

    return [];

  }



  private isContextReady(): boolean {

    if (!this.loaded()) return false;

    if (this.isStudent() || this.isParent()) {

      return !!this.getStudentId() && (this.isStudent() || this.linkedStudents().length > 0);

    }

    if (this.isTeacher()) {

      return !!this.getTeacherId();

    }

    return true;

  }



  private hasRole(...roles: Role[]): boolean {

    const role = this.auth.currentUser()?.role;

    return role ? roles.includes(role) : false;

  }

}


