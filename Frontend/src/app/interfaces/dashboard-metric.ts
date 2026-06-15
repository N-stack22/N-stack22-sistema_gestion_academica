export interface DashboardMetric {
  id: number;
  title: string;
  value: string | number;
  description: string;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}
