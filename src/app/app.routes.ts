import { Routes } from '@angular/router';
import { MainLayout } from './main-layout/main-layout';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'login',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'login',
  //   loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  // },
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
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'providers',
        loadComponent: () => import('./features/providers/providers').then((m) => m.Providers),
      },
      {
        path: 'game-type',
        loadComponent: () => import('./features/game-type/game-type').then((m) => m.GameType)
      }
    ],
  },
];
