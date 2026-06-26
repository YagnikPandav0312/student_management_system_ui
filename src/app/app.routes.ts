import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';
import { roleGuard } from './core/guard/role-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
        canActivate: [roleGuard],
        data: { role: 1 },
      },
      {
        path: 'teacher/dashboard',
        loadComponent: () =>
          import('./features/teacher-dashboard/teacher-dashboard').then((m) => m.TeacherDashboard),
        canActivate: [roleGuard],
        data: { role: 2 },
      },
      {
        path: 'student/dashboard',
        loadComponent: () =>
          import('./features/student-dashboard/student-dashboard').then((m) => m.StudentDashboard),
        canActivate: [roleGuard],
        data: { role: 3 },
      },
    ],
  },
];
