import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ticketActions from './actions';
import { catchError, EMPTY, exhaustMap, filter, map } from 'rxjs';
import { LocalStorageService } from '../../shared/local-storage.service';
import { AssistantResponse } from '../../shared/app.model';

@Injectable()
export class TicketsEffects {
  private actions$ = inject(Actions);
  private localStorageService: LocalStorageService = inject(LocalStorageService);

  saveTicket$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ticketActions.saveTicket),
      exhaustMap((ticket) => this.localStorageService.setItem('ticket', ticket.payload))
    );
  });

  // loadTickets$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ticketActions.loadTicket),
  //     exhaustMap(() => this.localStorageService.getItem('ticket')
  //       .pipe(
  //         filter(ticket => ticket !== null),
  //         map((ticket: AssistantResponse) => ({ type: ticketActions.TicketActions.SaveTicket, payload: ticket })),
  //         catchError(() => EMPTY)
  //       ))
  //   );
  // });
}
