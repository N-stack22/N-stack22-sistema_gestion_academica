import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
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
      { path: 'dashboard', component: Dashboard, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      { path: 'perfil', component: Profile, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      { path: 'notas', component: Grades, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      { path: 'horarios', component: Schedules, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      { path: 'tareas', component: Tasks, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      { path: 'recursos', component: Resources, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT'] } },
      { path: 'asistencia', component: Attendance, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      {
        path: 'seguimiento-padres',
        component: ParentTracking,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'PARENT'] },
      },
      { path: 'estudiantes', component: Students, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER'] } },
      {
        path: 'docentes',
        component: Teachers,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      {
        path: 'padres',
        component: Parents,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      {
        path: 'usuarios',
        component: Users,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      {
        path: 'cursos',
        component: Courses,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER'] },
      },
      {
        path: 'matriculas',
        component: Enrollments,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      {
        path: 'pensiones',
        component: Pensions,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR', 'PARENT'] },
      },
      {
        path: 'pagos',
        component: Payments,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR', 'PARENT'] },
      },
      {
        path: 'ventas',
        component: Sales,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      { path: 'comunicados-internos', component: InternalAnnouncements, canActivate: [roleGuard], data: { roles: ['ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] } },
      {
        path: 'reportes',
        component: Reports,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      {
        path: 'configuracion',
        component: Settings,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'DIRECTOR'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
