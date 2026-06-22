import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';
import { NewsArticle, NewsService } from '../../services/news.service';

@Component({
  selector: 'app-news',
  imports: [PageHeader, RouterLink],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News implements OnInit {
  private readonly newsService = inject(NewsService);
  public readonly articles = signal<NewsArticle[]>([]);

  ngOnInit(): void {
    this.newsService.listar().subscribe({
      next: (articles) => this.articles.set(articles),
    });
  }
}
