import { Component } from '@angular/core';
import { PageHeader } from '../../components/page-header/page-header';

interface GalleryItem {
  title: string;
  category: string;
  gradient: string;
}

@Component({
  selector: 'app-gallery',
  imports: [PageHeader],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  protected readonly items: GalleryItem[] = [
    { title: 'Olimpiada de matemática', category: 'Actividades académicas', gradient: 'linear-gradient(135deg, #0B1F3A, #1a4a7a)' },
    { title: 'Campeonato interescolar', category: 'Deportes', gradient: 'linear-gradient(135deg, #C1121F, #8f0e19)' },
    { title: 'Festival de danza', category: 'Arte y cultura', gradient: 'linear-gradient(135deg, #4B5563, #071527)' },
    { title: 'Aniversario institucional', category: 'Eventos institucionales', gradient: 'linear-gradient(135deg, #0B1F3A, #C1121F)' },
    { title: 'Taller de robótica', category: 'Actividades académicas', gradient: 'linear-gradient(135deg, #1a4a7a, #071527)' },
    { title: 'Copa Horizonte de fútbol', category: 'Deportes', gradient: 'linear-gradient(135deg, #071527, #4B5563)' },
    { title: 'Muestra de arte estudiantil', category: 'Arte y cultura', gradient: 'linear-gradient(135deg, #C1121F, #0B1F3A)' },
    { title: 'Ceremonia de promoción', category: 'Eventos institucionales', gradient: 'linear-gradient(135deg, #0B1F3A, #F4C430)' },
  ];
}
