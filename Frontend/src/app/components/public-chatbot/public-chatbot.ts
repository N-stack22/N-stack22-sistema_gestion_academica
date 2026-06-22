import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../interfaces/chat-message';

@Component({
  selector: 'app-public-chatbot',
  imports: [FormsModule],
  templateUrl: './public-chatbot.html',
  styleUrl: './public-chatbot.scss',
})
export class PublicChatbot {
  public readonly isOpen = signal(false);
  public readonly messages = signal<ChatMessage[]>([]);
  public readonly userInput = signal('');
  public readonly welcomeShown = signal(false);

  private nextId = 1;

  public readonly quickQuestions = [
    { label: 'Admisión', dataCy: 'public-chatbot-quick-admission' },
    { label: 'Niveles', dataCy: 'public-chatbot-quick-levels' },
    { label: 'Horarios', dataCy: 'public-chatbot-quick-schedule' },
    { label: 'Contacto', dataCy: 'public-chatbot-quick-contact' },
    { label: 'Intranet', dataCy: 'public-chatbot-quick-intranet' },
    { label: 'Pensiones', dataCy: 'public-chatbot-quick-pensions' },
    { label: 'Comunicados', dataCy: 'public-chatbot-quick-announcements' },
  ];

  public toggleChat(): void {
    const opening = !this.isOpen();
    this.isOpen.set(opening);

    if (opening && !this.welcomeShown()) {
      this.appendBotMessage(
        '¡Hola! Soy el asistente virtual de I.E.P. Horizonte. Puedo orientarte sobre admisión, niveles educativos, horarios, contacto, comunicados e intranet.',
      );
      this.welcomeShown.set(true);
    }
  }

  public closeChat(): void {
    this.isOpen.set(false);
  }

  public sendMessage(): void {
    const text = this.userInput().trim();
    if (!text) {
      return;
    }

    this.appendUserMessage(text);
    this.userInput.set('');
    this.appendBotMessage(this.getBotResponse(text));
  }

  public askQuickQuestion(question: string): void {
    this.appendUserMessage(question);
    this.appendBotMessage(this.getBotResponse(question));
  }

  public onInputChange(value: string): void {
    this.userInput.set(value);
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  public getBotResponse(message: string): string {
    const text = this.normalize(message);

    if (this.matches(text, ['admision', 'matricula', 'inscripcion'])) {
      return 'El proceso de admisión incluye solicitud de información, entrevista familiar, evaluación diagnóstica y matrícula. Puedes revisar la sección Admisión o comunicarte con nosotros desde Contacto.';
    }

    if (this.matches(text, ['nivel', 'niveles', 'inicial', 'primaria', 'secundaria'])) {
      return 'La I.E.P. Horizonte ofrece los niveles de Inicial, Primaria y Secundaria, con una propuesta educativa integral y acompañamiento permanente.';
    }

    if (this.matches(text, ['horario', 'horarios', 'atencion', 'atienden'])) {
      return 'Nuestro horario de atención es de lunes a viernes de 8:00 a.m. a 4:00 p.m. Para consultas específicas, puedes usar la página de Contacto.';
    }

    if (this.matches(text, ['contacto', 'telefono', 'correo', 'direccion', 'ubicacion'])) {
      return 'Puedes contactarnos al (064) 555-123, escribir a informes@iephorizonte.edu.pe o visitarnos en Av. Los Educadores 123, Huancayo.';
    }

    if (this.matches(text, ['intranet', 'login', 'plataforma', 'horizonte digital'])) {
      return 'La intranet Horizonte Digital permite a estudiantes, docentes, padres y administración consultar información académica según su rol. Puedes ingresar desde el botón Intranet.';
    }

    if (this.matches(text, ['pension', 'pago', 'pagos', 'mensualidad'])) {
      return 'La información de pensiones y pagos se consulta desde la intranet según el rol del usuario. Este proyecto muestra información simulada y no procesa pagos reales.';
    }

    if (this.matches(text, ['comunicado', 'comunicados', 'aviso', 'avisos', 'noticia', 'noticias'])) {
      return 'Los comunicados y noticias institucionales se publican en la web pública y también pueden consultarse desde la intranet según el perfil del usuario.';
    }

    return 'Puedo orientarte sobre admisión, niveles educativos, horarios, contacto, intranet, pensiones y comunicados. También puedes escribirnos desde la página de Contacto.';
  }

  public getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private appendUserMessage(text: string): void {
    this.messages.update((current) => [
      ...current,
      { id: this.nextId++, from: 'user', text, time: this.getCurrentTime() },
    ]);
  }

  private appendBotMessage(text: string): void {
    this.messages.update((current) => [
      ...current,
      { id: this.nextId++, from: 'bot', text, time: this.getCurrentTime() },
    ]);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private matches(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}
