import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  audience: string;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/comunicados`;

  listar(): Observable<AnnouncementItem[]> {
    return this.http.get<AnnouncementItem[]>(this.baseUrl);
  }
}
