import { Injectable, computed, inject, signal } from '@angular/core';
import { LinkedStudent } from '../interfaces/linked-student';
import { RoleContextService } from './role-context.service';
import { StudentContextService } from './student-context.service';

@Injectable({ providedIn: 'root' })
export class ParentContextService {
  private readonly roleContext = inject(RoleContextService);
  private readonly studentContext = inject(StudentContextService);

  readonly loading = computed(() => this.studentContext.loading());
  readonly error = signal('');

  readonly isParent = computed(() => this.roleContext.isParent());
  readonly linkedStudents = computed(() => this.roleContext.getLinkedStudents());
  readonly selectedStudentId = computed(() => this.roleContext.activeStudentId());
  readonly selectedStudent = computed(() => this.roleContext.getActiveStudent());
  readonly hasMultipleStudents = computed(() => this.linkedStudents().length > 1);
  readonly hasLinkedStudents = computed(() => this.linkedStudents().length > 0);
  readonly familyProfile = computed(() => this.roleContext.getFamilyProfile());
  readonly dashboard = computed(() => this.studentContext.dashboard());
  readonly enrollment = computed(() => this.studentContext.enrollment());
  readonly summary = computed(() => this.studentContext.summary());

  ensureLoaded(): void {
    if (!this.isParent()) return;
    this.roleContext.whenReady(() => this.loadDashboardForSelected());
  }

  selectStudent(studentId: string): void {
    if (!this.canAccessStudent(studentId)) {
      this.error.set('No tienes permiso para acceder a esta información.');
      return;
    }
    this.error.set('');
    this.roleContext.setSelectedStudentId(studentId);
    this.loadDashboardForSelected();
  }

  canAccessStudent(studentId: string | null | undefined): boolean {
    if (!studentId) return false;
    return this.linkedStudents().some((s) => s.id === studentId);
  }

  loadDashboardForSelected(): void {
    const studentId = this.selectedStudentId();
    if (!this.isParent() || !studentId) return;
    if (!this.canAccessStudent(studentId)) {
      this.error.set('No tienes permiso para acceder a esta información.');
      return;
    }
    this.studentContext.ensureLoaded();
  }

  reset(): void {
    this.error.set('');
  }

  studentLabel(student: LinkedStudent): string {
    return `${student.fullName} (${student.code}) — ${student.grade} ${student.section}`;
  }
}
