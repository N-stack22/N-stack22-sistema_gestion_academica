import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardAlertSeverity } from '../../interfaces/role-dashboard-panel';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [StatCard, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  protected readonly panel = computed(() => {
    const role = this.auth.currentUser()?.role ?? 'ADMIN';
    return this.dashboardService.getRolePanel(role);
  });

  protected alertClass(severity: DashboardAlertSeverity): string {
    const classes: Record<DashboardAlertSeverity, string> = {
      danger: 'erp-alert-card--danger',
      warning: 'erp-alert-card--warning',
      info: 'erp-alert-card--info',
    };
    return classes[severity];
  }
}
