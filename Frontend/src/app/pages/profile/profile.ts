import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleContextService } from '../../services/role-context.service';
import { TeacherContextService } from '../../services/teacher-context.service';
import { StudentContextService } from '../../services/student-context.service';
import { TeacherService } from '../../services/teacher.service';
import { StudentService } from '../../services/student.service';
import { Teacher } from '../../interfaces/teacher';
import { Student } from '../../interfaces/student';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  public readonly auth = inject(AuthService);
  public readonly roleContext = inject(RoleContextService);
  public readonly teacherContext = inject(TeacherContextService);
  public readonly studentContext = inject(StudentContextService);
  private readonly teacherService = inject(TeacherService);
  private readonly studentService = inject(StudentService);

  public readonly teacher = signal<Teacher | null>(null);
  public readonly student = signal<Student | null>(null);
  public readonly loading = signal(false);
  public readonly familyProfile = computed(() => this.roleContext.getFamilyProfile());

  ngOnInit(): void {
    if (this.roleContext.isParent()) {
      this.loading.set(true);
      this.roleContext.whenReady(() => this.loading.set(false));
      return;
    }

    if (this.roleContext.isTeacher()) {
      this.roleContext.whenReady(() => {
        const teacherId = this.roleContext.getTeacherId();
        if (!teacherId) return;
        this.loading.set(true);
        this.teacherService.obtener(teacherId).subscribe({
          next: (t) => {
            this.teacher.set(t);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
      return;
    }

    if (this.roleContext.isStudent()) {
      this.roleContext.whenReady(() => {
        this.studentContext.ensureLoaded();
        const studentId = this.roleContext.getStudentId();
        if (!studentId) return;
        this.loading.set(true);
        this.studentService.obtener(studentId).subscribe({
          next: (s) => {
            this.student.set(s);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      });
    }
  }

  public roleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      DIRECTOR: 'Director(a)',
      TEACHER: 'Docente',
      STUDENT: 'Estudiante',
      PARENT: 'Padre/Madre',
    };
    return labels[role] ?? role;
  }

  public userInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
