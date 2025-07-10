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
    path: 'ai-chat-gemini/:id',
    loadComponent: () => import('./chat/chat.component')
  },
  {
    path: 'ai-chat/:id',
    loadComponent: () => import('./gpt/gpt.component')
  }
];
