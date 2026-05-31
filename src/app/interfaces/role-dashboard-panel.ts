import { DashboardMetric } from './dashboard-metric';
import { RecentActivity } from './recent-activity';

export type DashboardTheme = 'institutional' | 'teacher' | 'student' | 'parent';

export type DashboardAlertSeverity = 'danger' | 'warning' | 'info';

export interface DashboardAlert {
  id: number;
  title: string;
  description: string;
  icon: string;
  severity: DashboardAlertSeverity;
}

export interface DashboardQuickAccess {
  label: string;
  icon: string;
  route: string;
}

export interface RoleDashboardPanel {
  title: string;
  subtitle: string;
  theme: DashboardTheme;
  portalLabel: string;
  alertsTitle: string;
  eventsTitle: string;
  quickAccessTitle: string;
  metrics: DashboardMetric[];
  alerts: DashboardAlert[];
  events: RecentActivity[];
  quickAccess: DashboardQuickAccess[];
}
