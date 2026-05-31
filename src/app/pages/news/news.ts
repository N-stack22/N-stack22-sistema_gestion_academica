import { Component } from '@angular/core';
import { PageHeader } from '../../components/page-header/page-header';

interface NewsArticle {
  title: string;
  date: string;
  category: string;
  summary: string;
}

@Component({
  selector: 'app-news',
  imports: [PageHeader],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  protected readonly articles: NewsArticle[] = [
    {
      title: 'Inicio del año escolar 2026',
      date: '10 Mar 2026',
      category: 'Institucional',
      summary: 'Damos la bienvenida a la comunidad horizontina con una ceremonia de apertura y actividades de integración.',
    },
    {
      title: 'Feria de ciencias Horizonte',
      date: '28 Feb 2026',
      category: 'Académico',
      summary: 'Estudiantes de primaria y secundaria presentaron proyectos innovadores ante jurados y familias.',
    },
    {
      title: 'Logros destacados en matemática',
      date: '15 Feb 2026',
      category: 'Reconocimientos',
      summary: 'Nuestros equipos obtuvieron medallas en la etapa regional del concurso escolar de matemática.',
    },
    {
      title: 'Campaña de lectura institucional',
      date: '05 Feb 2026',
      category: 'Cultural',
      summary: 'Durante febrero promovemos hábitos lectoros con talleres, feria de libros y lecturas en voz alta.',
    },
  ];
}
