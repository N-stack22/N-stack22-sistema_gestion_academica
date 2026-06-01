import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { About } from './pages/about/about';
import { Admission } from './pages/admission/admission';
import { Announcements } from './pages/announcements/announcements';
import { Attendance } from './pages/attendance/attendance';
import { Contact } from './pages/contact/contact';
import { Courses } from './pages/courses/courses';
import { Dashboard } from './pages/dashboard/dashboard';
import { Enrollments } from './pages/enrollments/enrollments';
import { Gallery } from './pages/gallery/gallery';
import { Grades } from './pages/grades/grades';
import { Home } from './pages/home/home';
import { InternalAnnouncements } from './pages/internal-announcements/internal-announcements';
import { Levels } from './pages/levels/levels';
import { Login } from './pages/login/login';
import { News } from './pages/news/news';
import { ParentTracking } from './pages/parent-tracking/parent-tracking';
import { Parents } from './pages/parents/parents';
import { Payments } from './pages/payments/payments';
import { Pensions } from './pages/pensions/pensions';
import { Platform } from './pages/platform/platform';
import { Profile } from './pages/profile/profile';
import { Reports } from './pages/reports/reports';
import { Resources } from './pages/resources/resources';
import { Sales } from './pages/sales/sales';
import { Schedules } from './pages/schedules/schedules';
import { Settings } from './pages/settings/settings';
import { Students } from './pages/students/students';
import { Tasks } from './pages/tasks/tasks';
import { Teachers } from './pages/teachers/teachers';
import { Users } from './pages/users/users';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'nosotros', component: About },
      { path: 'niveles', component: Levels },
      { path: 'admision', component: Admission },
      { path: 'plataforma', component: Platform },
      { path: 'noticias', component: News },
      { path: 'comunicados', component: Announcements },
      { path: 'galeria', component: Gallery },
      { path: 'contacto', component: Contact },
      { path: 'login', component: Login },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'perfil', component: Profile },
      { path: 'notas', component: Grades },
      { path: 'horarios', component: Schedules },
      { path: 'tareas', component: Tasks },
      { path: 'recursos', component: Resources },
      { path: 'asistencia', component: Attendance },
      { path: 'seguimiento-padres', component: ParentTracking },
      { path: 'estudiantes', component: Students },
      { path: 'docentes', component: Teachers },
      { path: 'padres', component: Parents },
      { path: 'usuarios', component: Users },
      { path: 'cursos', component: Courses },
      { path: 'matriculas', component: Enrollments },
      { path: 'pensiones', component: Pensions },
      { path: 'pagos', component: Payments },
      { path: 'ventas', component: Sales },
      { path: 'comunicados-internos', component: InternalAnnouncements },
      { path: 'reportes', component: Reports },
      { path: 'configuracion', component: Settings },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
