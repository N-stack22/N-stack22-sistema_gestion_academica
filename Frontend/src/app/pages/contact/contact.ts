import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';
import { isPhoneNineDigits, isRequired, isValidEmail, minLength } from '../../utils/form-validation';

@Component({
  selector: 'app-contact',
  imports: [PageHeader, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  public readonly fullName = signal('');
  public readonly email = signal('');
  public readonly phone = signal('');
  public readonly subject = signal('');
  public readonly message = signal('');
  public readonly submitted = signal(false);
  public readonly successMessage = signal('');

  public readonly fullNameError = computed(() => {
    if (!this.submitted() && !this.fullName()) return '';
    return isRequired(this.fullName(), 'El nombre es obligatorio.') || minLength(this.fullName(), 3, 'El nombre debe tener al menos 3 caracteres.');
  });

  public readonly emailError = computed(() => {
    if (!this.submitted() && !this.email()) return '';
    const required = isRequired(this.email(), 'El correo es obligatorio.');
    if (required) return required;
    return isValidEmail(this.email()) ? '' : 'Ingresa un correo válido.';
  });

  public readonly phoneError = computed(() => {
    if (!this.submitted() && !this.phone()) return '';
    const required = isRequired(this.phone(), 'El teléfono es obligatorio.');
    if (required) return required;
    return isPhoneNineDigits(this.phone()) ? '' : 'El teléfono debe tener 9 dígitos.';
  });

  public readonly subjectError = computed(() => {
    if (!this.submitted() && !this.subject()) return '';
    return isRequired(this.subject(), 'El asunto es obligatorio.') || minLength(this.subject(), 4, 'El asunto debe tener al menos 4 caracteres.');
  });

  public readonly messageError = computed(() => {
    if (!this.submitted() && !this.message()) return '';
    return isRequired(this.message(), 'El mensaje es obligatorio.') || minLength(this.message(), 10, 'El mensaje debe tener al menos 10 caracteres.');
  });

  public readonly isFormValid = computed(
    () =>
      !this.fullNameError() &&
      !this.emailError() &&
      !this.phoneError() &&
      !this.subjectError() &&
      !this.messageError(),
  );

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.successMessage.set('');

    if (!this.isFormValid()) {
      return;
    }

    this.successMessage.set('Mensaje enviado correctamente. Nos comunicaremos contigo pronto.');
    this.fullName.set('');
    this.email.set('');
    this.phone.set('');
    this.subject.set('');
    this.message.set('');
    this.submitted.set(false);
  }
}
