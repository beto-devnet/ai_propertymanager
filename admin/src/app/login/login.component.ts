import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LoginService } from './login.service';
import { PropertyBrief } from './models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faG, faAppleWhole, faF } from '@fortawesome/free-solid-svg-icons';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
    MatRipple,
    FontAwesomeModule,
    MatMiniFabButton,
    MatIcon
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnInit {

  private service: LoginService = inject(LoginService);
  private destroyRef$ = inject(DestroyRef);
  private router: Router = inject(Router);
  selectedUserId: number = 1;
  passwordControl: FormControl = new FormControl<string>('');
  useGeminiControl: FormControl = new FormControl(false);
  properties = signal<PropertyBrief[]>([]);

  faGoogle =  faG;
  faApple = faAppleWhole;
  faFacebook =  faF
  ngOnInit(): void {
    this.service
      .allPropertiesBrief()
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        tap((result: PropertyBrief[]) => {
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
