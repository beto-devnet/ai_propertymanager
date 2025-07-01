import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LoginService } from './login.service';
import { PropertyBrief } from './models';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule
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
  properties = signal<PropertyBrief[]>([]);

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

    this.router.navigate(['/ai-chat', this.selectedUserId]);
  }

  changeSelectedUser(ev: any) {
    this.selectedUserId = ev.target.value;
  }

}
