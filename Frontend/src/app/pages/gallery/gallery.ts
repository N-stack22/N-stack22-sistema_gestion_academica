import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';

interface GalleryItem {
  title: string;
  category: string;
  gradient: string;
  icon: string;
  caption: string;
}

@Component({
  selector: 'app-gallery',
  imports: [PageHeader, RouterLink, NgClass],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  public readonly items: GalleryItem[] = [
    {
      title: 'Olimpiada de matemática',
      category: 'Actividades académicas',
      gradient: 'linear-gradient(135deg, #0B1F3A, #1a4a7a)',
      icon: 'bi-calculator-fill',
      caption: 'Equipos destacados en competencias regionales.',
    },
    {
      title: 'Campeonato interescolar',
      category: 'Deportes',
      gradient: 'linear-gradient(135deg, #C1121F, #8f0e19)',
      icon: 'bi-trophy-fill',
      caption: 'Torneos deportivos con espíritu de fair play.',
    },
    {
      title: 'Festival de danza',
      category: 'Arte y cultura',
      gradient: 'linear-gradient(135deg, #4B5563, #071527)',
      icon: 'bi-music-note-beamed',
      caption: 'Expresión artística y tradiciones peruanas.',
    },
    {
      title: 'Aniversario institucional',
      category: 'Eventos institucionales',
      gradient: 'linear-gradient(135deg, #0B1F3A, #C1121F)',
      icon: 'bi-balloon-fill',
      caption: 'Celebración con toda la comunidad horizontina.',
    },
    {
      title: 'Taller de robótica',
      category: 'Actividades académicas',
      gradient: 'linear-gradient(135deg, #1a4a7a, #071527)',
      icon: 'bi-cpu-fill',
      caption: 'Innovación y pensamiento computacional.',
    },
    {
      title: 'Copa Horizonte de fútbol',
      category: 'Deportes',
      gradient: 'linear-gradient(135deg, #071527, #4B5563)',
      icon: 'bi-dribbble',
      caption: 'Intercambio deportivo entre niveles.',
    },
    {
      title: 'Muestra de arte estudiantil',
      category: 'Arte y cultura',
      gradient: 'linear-gradient(135deg, #C1121F, #0B1F3A)',
      icon: 'bi-brush-fill',
      caption: 'Exposición de trabajos creativos.',
    },
    {
      title: 'Ceremonia de promoción',
      category: 'Eventos institucionales',
      gradient: 'linear-gradient(135deg, #0B1F3A, #F4C430)',
      icon: 'bi-mortarboard-fill',
      caption: 'Cierre de etapa y nuevos horizontes.',
    },
  ];
}
