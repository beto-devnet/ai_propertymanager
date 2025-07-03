import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent:() => import('./admin/admin.component')
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
  },
  {
    path: 'ai-chat/:id',
    loadComponent: () => import('./chat/chat.component')
  },
  // {
  //   path: 'ai-chat/:id',
  //   data: {residentId: 0, issue: '' },
  //   loadComponent: () => import('./demo/demo.component')
  // }
];
