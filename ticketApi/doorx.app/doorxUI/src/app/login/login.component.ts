import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LoginService } from './login.service';
import { TenantLogin } from './models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatMiniFabButton } from '@angular/material/button';
import { Icon } from '../shared/components/icon/icon';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
    MatRipple,
    MatMiniFabButton,
    Icon
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',

})
export default class LoginComponent implements OnInit {

  private service: LoginService = inject(LoginService);
  private destroyRef$ = inject(DestroyRef);
  private router: Router = inject(Router);
  selectedUserId: number = 1;
  passwordControl: FormControl = new FormControl<string>('');
  useGeminiControl: FormControl = new FormControl(false);
  properties = signal<TenantLogin[]>([]);

  async ngOnInit(): Promise<void> {
    this.service
      .getAllTenants()
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        tap((result: TenantLogin[]) => {
          this.selectedUserId = result[0].id;
          this.properties.set(result);
        })
      )
      .subscribe();
  }

  submit(): void {
    if(this.passwordControl.value === '') {
      return;
    }
    if (this.useGeminiControl.value === false) {
      this.router.navigate(['/ai-chat', this.selectedUserId]);
    } else {
      this.router.navigate(['/ai-chat-gemini', this.selectedUserId]);
    }

  }

  changeSelectedUser(ev: any) {
    this.selectedUserId = ev.target.value;
  }
}
