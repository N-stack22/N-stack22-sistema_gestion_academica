import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';

@Component({
  selector: 'app-about',
  imports: [PageHeader, RouterLink, NgClass],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  public readonly values = [
    { name: 'Responsabilidad', text: 'Cumplimos nuestros compromisos académicos y formativos con constancia.' },
    { name: 'Respeto', text: 'Valoramos la dignidad de cada persona en nuestra comunidad educativa.' },
    { name: 'Excelencia', text: 'Buscamos altos estándares de aprendizaje y mejora continua.' },
    { name: 'Innovación', text: 'Incorporamos metodologías y recursos que enriquecen la enseñanza.' },
  ];

  public readonly differentiators = [
    {
      icon: 'bi-award-fill',
      title: 'Trayectoria sólida',
      text: 'Más de 25 años formando generaciones en Huancayo con resultados académicos consistentes.',
    },
    {
      icon: 'bi-heart-pulse-fill',
      title: 'Acompañamiento cercano',
      text: 'Equipo de orientación y tutores que trabajan junto a cada familia durante el año escolar.',
    },
    {
      icon: 'bi-pc-display-horizontal',
      title: 'Gestión digital',
      text: 'Plataforma HORIZONTE DIGITAL para comunicación, seguimiento y gestión académica simulada.',
    },
    {
      icon: 'bi-tree-fill',
      title: 'Formación en valores',
      text: 'Proyectos institucionales que integran responsabilidad, respeto y servicio a la comunidad.',
    },
  ];
}
