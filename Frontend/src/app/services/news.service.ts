import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/noticias`;

  listar(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(this.baseUrl);
  }
}
