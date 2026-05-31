export interface RecentActivity {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'academic' | 'administrative' | 'communication';
}
