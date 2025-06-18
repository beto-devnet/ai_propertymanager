import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Subject, takeUntil, tap, timer } from 'rxjs';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgOptimizedImage} from '@angular/common';
import { TicketApiService } from '../ticket-api.service';
import { AssistantRequest, AssistantResponse, IssueDescriptorForm } from '../../shared/app.model';
import { Store } from '@ngrx/store';
import * as ticketActions from '../../store/tickets/actions';
import { Router } from '@angular/router';
import { AppDataService } from '../../app-data.service';

@Component({
  selector: 'app-root',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButton, MatProgressSpinnerModule, ReactiveFormsModule, MatExpansionModule, NgOptimizedImage],
  templateUrl: './resident.component.html',
  styleUrl: './resident.component.css'
})
export default class AppComponent implements OnInit, OnDestroy {
  private service:TicketApiService = inject(TicketApiService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private store: Store<AssistantResponse> = inject(Store);
  private destroy$ = new Subject<void>();
  private router: Router = inject(Router);
  private appDataService: AppDataService = inject(AppDataService);
  private initialResponse: AssistantResponse = {
    ticket: {
      tenant: '',
      matchedProperty: '',
      landlord: '',
      category: '',
      issue: '',
      likelyCause: ''
    },
    leaseAgreementReview: {
      importantContractObligations: '',
      resolutionResponsibility: ''
    },
    recommendedSolution: '',
    recommendedSuppliers: [],
    insufficientInformation: false
  };

  readonly panelOpenState = signal(false);
  issueDescriptorForm: FormGroup<IssueDescriptorForm>;
  response = signal<AssistantResponse>(this.initialResponse);
  isLoadingAnswer = signal<boolean>(false);
  showErrorInForm = signal<boolean>(false);

  constructor() {
    this.issueDescriptorForm = this.createForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {}
  title = 'admin';

  processIssue() {

    if(this.issueDescriptorForm.controls.issue.value.length === 0) {
      return;
    }

    this.isLoadingAnswer.update(() => true);

    // this.appDataService.setAppData({  issue: this.issueDescriptorForm.controls.issue.value })
    // timer(2500).subscribe(() => this.router.navigate(['/ai-chat']));
    // const request: AssistantRequest = {
    //   issueDescription: this.issueDescriptorForm.controls.issue.value,
    // }

    // this.service
    //   .reportIssue(request)
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     tap((result: AssistantResponse) => {
    //       this.response.update(() => result);
    //     }),
    //     tap((result: AssistantResponse) => {
    //       console.log('result', result);
    //       this.store.dispatch(ticketActions.saveTicket({ payload: result }));
    //     }),
    //   )
    //   .subscribe({
    //     complete: () => this.isLoadingAnswer.update(() => false),
    //     error: () => this.isLoadingAnswer.update(() => false)
    //   });
  }

  private createForm() {
    return this.formBuilder.group<IssueDescriptorForm>({
      issue: this.formBuilder.nonNullable.control('The AC is not working on Auto mode'),
    });
  }
}
