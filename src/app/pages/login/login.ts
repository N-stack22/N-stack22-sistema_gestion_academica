import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitted = signal(false);
  protected readonly authError = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly demoCredentials = this.auth.getDemoCredentials();

  protected readonly intranetBenefits = [
    { icon: 'bi-speedometer2', text: 'Dashboard ejecutivo con métricas académicas simuladas.' },
    { icon: 'bi-journal-check', text: 'Notas, horarios, tareas y recursos según tu rol.' },
    { icon: 'bi-shield-lock', text: 'Acceso seguro simulado con credenciales institucionales.' },
    { icon: 'bi-people', text: 'Portales diferenciados para estudiantes, docentes, padres y administración.' },
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

    const success = this.auth.login({
      email: this.email().trim(),
      password: this.password(),
    });

    if (success) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/dashboard';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.authError.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }

    this.isSubmitting.set(false);
  }
}
