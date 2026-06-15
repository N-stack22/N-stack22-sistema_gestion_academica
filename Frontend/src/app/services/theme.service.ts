import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'horizonte_dark_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkSignal = signal(false);
  readonly isDark = this.darkSignal.asReadonly();

  loadFromCache(): void {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached !== null) {
      this.apply(cached === 'true', false);
    }
  }

  syncFromServer(temaOscuro: boolean): void {
    this.apply(temaOscuro, true);
  }

  apply(dark: boolean, persist = true): void {
    this.darkSignal.set(dark);
    if (persist) {
      localStorage.setItem(STORAGE_KEY, String(dark));
    }
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
    document.body.classList.toggle('horizonte-dark-theme', dark);
  }
}
