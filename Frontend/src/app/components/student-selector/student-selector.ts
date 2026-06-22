import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParentContextService } from '../../services/parent-context.service';
import { RoleContextService } from '../../services/role-context.service';

@Component({
  selector: 'app-student-selector',
  imports: [FormsModule],
  templateUrl: './student-selector.html',
  styleUrl: './student-selector.scss',
})
export class StudentSelector {
  public readonly roleContext = inject(RoleContextService);
  public readonly parentContext = inject(ParentContextService);

  public onStudentChange(studentId: string): void {
    if (!studentId) return;
    this.parentContext.selectStudent(studentId);
  }
}
