import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';

interface LevelCard {
  name: string;
  icon: string;
  ages: string;
  grades: string;
  description: string;
  benefits: string[];
  focus: string;
  accent: string;
  photoVariant: string;
}

@Component({
  selector: 'app-levels',
  imports: [PageHeader, RouterLink, NgClass],
  templateUrl: './levels.html',
  styleUrl: './levels.scss',
})
export class Levels {
  public readonly levels: LevelCard[] = [
    {
      name: 'Inicial',
      icon: 'bi-palette-fill',
      ages: '3 a 5 años',
      grades: '3, 4 y 5 años',
      description: 'Ambientes lúdicos y seguros que favorecen la curiosidad, la expresión y la autonomía.',
      benefits: ['Desarrollo psicomotor', 'Inicio de lectoescritura', 'Socialización guiada'],
      focus: 'Aprendizaje basado en juego, estimulación temprana y afecto seguro.',
      accent: 'inicial',
      photoVariant: 'learning',
    },
    {
      name: 'Primaria',
      icon: 'bi-book-fill',
      ages: '6 a 11 años',
      grades: '1.° a 6.° grado',
      description: 'Fortalecimiento de competencias básicas con proyectos interdisciplinarios.',
      benefits: ['Comunicación y matemática', 'Ciencia y tecnología', 'Formación en valores'],
      focus: 'Competencias fundamentales con metodologías activas y tutoría personalizada.',
      accent: 'primaria',
      photoVariant: 'culture',
    },
    {
      name: 'Secundaria',
      icon: 'bi-mortarboard-fill',
      ages: '12 a 16 años',
      grades: '1.° a 5.° año',
      description: 'Preparación académica exigente con orientación vocacional y liderazgo estudiantil.',
      benefits: ['Pensamiento crítico', 'Preparación universitaria', 'Proyectos de emprendimiento'],
      focus: 'Rigor académico, orientación vocacional y desarrollo de liderazgo.',
      accent: 'secundaria',
      photoVariant: 'tech',
    },
    {
      name: 'CEBA',
      icon: 'bi-clock-history',
      ages: 'Jóvenes y adultos',
      grades: 'Modalidad alternativa',
      description: 'Educación básica alternativa con horarios flexibles para quienes trabajan o retoman sus estudios.',
      benefits: ['Horarios flexibles', 'Avance por competencias', 'Acompañamiento personalizado'],
      focus: 'Formación flexible, organizada y orientada a la conclusión de la educación básica.',
      accent: 'ceba',
      photoVariant: 'learning',
    },
  ];
}
