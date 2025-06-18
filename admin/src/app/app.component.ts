import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AssistantResponse } from './shared/app.model';
import { filter, tap } from 'rxjs';
import { saveTicket } from './store/tickets/actions';
import { LocalStorageService } from './shared/local-storage.service';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
  MatSidenav,
  MatSidenavContainer, MatSidenavContent
} from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDrawerContainer, MatDrawer, MatDrawerContent, MatToolbar, MatSidenav, MatSidenavContainer, MatSidenavContent, MatNavList],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export default class AppComponent implements OnInit {
  private store: Store<AssistantResponse> = inject(Store);
  private localStorageService: LocalStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    // this.store.dispatch(loadTicket({}));
    this.localStorageService.getItem('ticket')
      .pipe(
        filter(ticket => ticket !== null),
        tap((ticket: AssistantResponse) =>
          this.store.dispatch(saveTicket({ payload: ticket }))
        )
      )
      .subscribe();
  }

}
