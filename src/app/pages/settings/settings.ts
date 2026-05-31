import { Component } from '@angular/core';

interface SettingsCard {
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  protected readonly cards: SettingsCard[] = [
    {
      title: 'Datos institucionales',
      icon: 'bi-building',
      description: 'Nombre del colegio, dirección, contacto y datos legales simulados.',
    },
    {
      title: 'Parámetros académicos',
      icon: 'bi-calendar3',
      description: 'Año escolar, bimestres, niveles y grados (vista informativa).',
    },
    {
      title: 'Usuarios y roles',
      icon: 'bi-shield-lock',
      description: 'Configuración simulada de roles ADMIN, DIRECTOR, TEACHER, STUDENT y PARENT.',
    },
    {
      title: 'Apariencia del sistema',
      icon: 'bi-palette',
      description: 'Preferencias visuales y tema institucional Horizonte (sin lógica real).',
    },
  ];
}
