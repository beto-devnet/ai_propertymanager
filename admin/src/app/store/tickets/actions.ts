import { createAction, emptyProps, props } from '@ngrx/store';
import { AssistantResponse } from '../../shared/app.model';

export enum TicketActions {
  SaveTicket = 'SAVE_TICKET',
  LoadTickets = 'LOAD_TICKET'
}

export const saveTicket = createAction(
  TicketActions.SaveTicket,
  props<{ payload: AssistantResponse }>()
);


// export const loadTicket = createAction(TicketActions.LoadTickets);
