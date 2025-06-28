import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { AssistantResponse, Supplier } from '../shared/app.model';
import { ticketFeature } from '../store/tickets/reducers';
import { combineLatest, combineLatestWith, filter, map, tap, withLatestFrom } from 'rxjs';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatList, MatListItem, MatNavList } from '@angular/material/list';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent, MatDrawerMode,
  MatSidenav,
  MatSidenavContainer, MatSidenavContent
} from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LocalStorageService } from '../shared/local-storage.service';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { BreakpointObserver, Breakpoints, BreakpointState, LayoutModule } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface Response {
  code:  string,
  tenant: string,
  issue: string,
  landlord: string,
  property: string,
  solutions: string,
  suppliers: Supplier[]
}
@Component({
  selector: 'app-admin',
  imports: [
    NgOptimizedImage,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatList,
    MatListItem,
    MatToolbar,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    MatIconButton,
    MatIcon,
    CdkCopyToClipboard,
    MatNavList,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    LayoutModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export default class AdminComponent implements OnInit {
  private store: Store<AssistantResponse> = inject(Store);
  private storage: LocalStorageService = inject(LocalStorageService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef: DestroyRef = inject(DestroyRef);
  @ViewChild('sideNav') sideNav!: MatSidenav;
  sideNavMode = signal<MatDrawerMode>('over');
  sideNavOpened = signal<boolean>(false);

  code = signal<string>('');
  readonly panelOpenState = signal(false);
  assistantResponse = signal<Response>({
    code: '',
    tenant: '',
    issue: '',
    landlord: '',
    property: '',
    solutions: '',
    suppliers: []
  });
  private assistantResponseInitialData: AssistantResponse = {
  ticket: {
    tenant: '',
    matchedProperty: '',
    landlord: '',
    category: '',
    issue: '',
    likelyCause: '',
  },
  leaseAgreementReview: {
    importantContractObligations: '',
    resolutionResponsibility: '',
  },
  recommendedSolution: '',
  recommendedSuppliers: [],
  insufficientInformation: false
}

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res: BreakpointState) => {
          if(res.matches) {
            this.sideNavMode.set('over');
            this.sideNavOpened.set(false);

          } else{
            this.sideNavMode.set('side');
            this.sideNavOpened.set(true);
          }
        })
      )
      .subscribe();

    const fromStore = this.store.select(ticketFeature.selectCurrentTicket)
      .pipe(
        map(result => {
          if(result.isInitialStatus) {
            return null
          } else {
            return result.assistantResponse
          }
        })
      );

    const fromStorage = this.storage.getItem('ticket');

    fromStore.pipe(
      combineLatestWith(fromStorage),
      map(([fromStoreResult, fromStorageResult]: [fromStoreResult: AssistantResponse|null, fromStorageResult: AssistantResponse|null]) => {
        if(fromStoreResult !== null) {
          return fromStoreResult;
        } else if(fromStorageResult !== null) {
          return fromStorageResult;
        } else {
          return this.assistantResponseInitialData;
        }
      }),
      tap((resultCode: AssistantResponse) => {
        this.code.set(JSON.stringify(resultCode));
        this.assistantResponse.set({
          code: JSON.stringify(resultCode.ticket, null, 2),
          tenant: resultCode.ticket.tenant,
          issue: resultCode.ticket.issue,
          landlord: resultCode.ticket.landlord,
          property: resultCode.ticket.matchedProperty,
          solutions: resultCode.recommendedSolution,
          suppliers: resultCode.recommendedSuppliers
        })
      })
    ).subscribe();

    this.store
      .select(ticketFeature.selectCurrentTicket)
      .pipe(
        filter(tiket => tiket.isInitialStatus === false),
        tap(result => {
          const resultCode = result.assistantResponse;
          this.code.set(JSON.stringify(resultCode));
          this.assistantResponse.set({
            code: JSON.stringify(resultCode.ticket),
            tenant: resultCode.ticket.tenant,
            issue: resultCode.ticket.issue,
            landlord: resultCode.ticket.landlord,
            property: resultCode.ticket.matchedProperty,
            solutions: resultCode.recommendedSolution,
            suppliers: resultCode.recommendedSuppliers
          });
        })
      )
      .subscribe();
  }

}
