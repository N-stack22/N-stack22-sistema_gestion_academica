import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../components/page-header/page-header';
import { AnnouncementItem, AnnouncementService } from '../../services/announcement.service';

@Component({
  selector: 'app-announcements',
  imports: [PageHeader, RouterLink],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
})
export class Announcements implements OnInit {
  private readonly announcementService = inject(AnnouncementService);
  public readonly items = signal<AnnouncementItem[]>([]);

  ngOnInit(): void {
    this.announcementService.listar().subscribe({
      next: (items) => this.items.set(items),
    });
  }
}
