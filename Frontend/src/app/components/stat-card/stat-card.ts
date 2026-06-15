import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { DashboardMetric } from '../../interfaces/dashboard-metric';

@Component({
  selector: 'app-stat-card',
  imports: [NgClass],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly description = input<string>('');
  readonly icon = input<string>('bi-bar-chart-fill');
  readonly variant = input<DashboardMetric['variant']>('primary');
}
