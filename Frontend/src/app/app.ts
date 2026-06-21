import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(router: Router) {
    const redirect = sessionStorage.getItem('horizonte:redirect');
    if (redirect) {
      sessionStorage.removeItem('horizonte:redirect');
      queueMicrotask(() => router.navigateByUrl(redirect));
    }
  }
}
