import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./front/resident/resident.component')
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
