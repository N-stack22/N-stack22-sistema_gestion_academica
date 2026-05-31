import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';

type AnnouncementStatus = 'Importante' | 'Informativo' | 'Académico';

interface Announcement {
  date: string;
  title: string;
  level: string;
  description: string;
  status: AnnouncementStatus;
  statusClass: string;
}

@Component({
  selector: 'app-announcements',
  imports: [PageHeader, RouterLink, NgClass],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
})
export class Announcements {
  protected readonly items: Announcement[] = [
    {
      date: '12 Mar 2026',
      title: 'Reunión general de padres',
      level: 'Todos los niveles',
      description: 'Invitamos a apoderados al auditorio principal el viernes 20 de marzo, 18:30 h.',
      status: 'Importante',
      statusClass: 'public-badge--important',
    },
    {
      date: '08 Mar 2026',
      title: 'Cronograma de evaluaciones',
      level: 'Primaria y Secundaria',
      description: 'Se publica el calendario del primer bimestre con fechas de evaluaciones formativas y sumativas.',
      status: 'Académico',
      statusClass: 'public-badge--academic',
    },
    {
      date: '01 Mar 2026',
      title: 'Campaña de salud escolar',
      level: 'Inicial y Primaria',
      description: 'Jornada de tamizaje visual y taller de hábitos saludables durante la semana del 10 al 14 de marzo.',
      status: 'Informativo',
      statusClass: 'public-badge--info',
    },
    {
      date: '25 Feb 2026',
      title: 'Horario especial por actividad institucional',
      level: 'Secundaria',
      description: 'El miércoles 5 de marzo las clases concluirán a las 12:00 h. por evento de formación docente.',
      status: 'Informativo',
      statusClass: 'public-badge--info',
    },
  ];
}
