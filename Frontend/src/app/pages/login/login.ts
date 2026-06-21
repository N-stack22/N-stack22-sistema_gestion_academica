import { NgClass } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RoleContextService } from '../../services/role-context.service';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [RouterLink, NgClass, FormField, FormRoot],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly roleContext = inject(RoleContextService);

  protected readonly authError = signal('');
  protected readonly loginModel = signal<LoginModel>({ email: '', password: '' });
  protected readonly showPassword = signal(false);

  protected readonly loginForm = form(
    this.loginModel,
    (fields) => {
      required(fields.email, { message: 'El correo es obligatorio.' });
      email(fields.email, { message: 'Ingresa un correo válido.' });
      required(fields.password, { message: 'La contraseña es obligatoria.' });
    },
    {
      submission: {
        action: async () => this.performLogin(),
      },
    },
  );

  protected readonly intranetBenefits = [
    { icon: 'bi-person-badge', text: 'Acceso diferenciado por rol.' },
    { icon: 'bi-people', text: 'Seguimiento académico para familias.' },
    { icon: 'bi-grid-1x2', text: 'Gestión escolar conectada a Supabase.' },
  ];

  protected togglePasswordVisibility(): void {
    this.showPassword.update((isVisible) => !isVisible);
  }

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }

    effect(() => {
      this.loginModel();
      this.authError.set('');
    });
  }

  private async performLogin(): Promise<void> {
    this.authError.set('');
    const { email: emailValue, password } = this.loginModel();

    try {
      await firstValueFrom(
        this.auth.login({
          email: emailValue.trim(),
          password,
        }),
      );
      this.roleContext.reset();
      this.roleContext.loadContext();
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch (err: unknown) {
      const detail = (err as { error?: { detail?: string } })?.error?.detail;
      this.authError.set(detail ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  }
}
