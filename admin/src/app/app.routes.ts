import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/ai-chat',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent:() => import('./admin/admin.component')
  },
  {
    path: 'ai-chat',
    data: {residentId: 0, issue: '' },
    loadComponent: () => import('./demo/demo.component')
  }
];
