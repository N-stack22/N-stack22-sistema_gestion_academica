import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleContextService } from '../../services/role-context.service';
import { isValidEmail } from '../../utils/form-validation';

@Component({
  selector: 'app-login',
  imports: [RouterLink, NgClass],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roleContext = inject(RoleContextService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitted = signal(false);
  protected readonly authError = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly intranetBenefits = [
    { icon: 'bi-person-badge', text: 'Acceso diferenciado por rol.' },
    { icon: 'bi-people', text: 'Seguimiento académico para familias.' },
    { icon: 'bi-grid-1x2', text: 'Gestión escolar conectada a Supabase.' },
  ];

  protected readonly emailError = computed(() => {
    if (!this.submitted() && !this.email()) {
      return '';
    }
    const value = this.email().trim();
    if (!value) {
      return 'El correo es obligatorio.';
    }
    if (!isValidEmail(value)) {
      return 'Ingresa un correo válido.';
    }
    return '';
  });

  protected readonly passwordError = computed(() => {
    if (!this.submitted() && !this.password()) {
      return '';
    }
    if (!this.password()) {
      return 'La contraseña es obligatoria.';
    }
    return '';
  });

  protected readonly isFormValid = computed(() => !this.emailError() && !this.passwordError());

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.authError.set('');

    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting.set(true);

    this.auth
      .login({
        email: this.email().trim(),
        password: this.password(),
      })
      .subscribe({
        next: () => {
          this.roleContext.reset();
          this.roleContext.loadContext();
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.authError.set(err.error?.detail ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.');
          this.isSubmitting.set(false);
        },
      });
  }
}
