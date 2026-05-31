import { Component } from '@angular/core';
import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-about',
  imports: [PageHeader],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly values = [
    { name: 'Responsabilidad', text: 'Cumplimos nuestros compromisos académicos y formativos con constancia.' },
    { name: 'Respeto', text: 'Valoramos la dignidad de cada persona en nuestra comunidad educativa.' },
    { name: 'Excelencia', text: 'Buscamos altos estándares de aprendizaje y mejora continua.' },
    { name: 'Innovación', text: 'Incorporamos metodologías y recursos que enriquecen la enseñanza.' },
  ];
}
