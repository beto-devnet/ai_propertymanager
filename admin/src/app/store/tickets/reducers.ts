import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import  * as TicketActions  from './actions'
import { AssistantResponse, LeaseAgreementReview, Supplier, Ticket } from '../../shared/app.model';

export interface State {
  assistantResponse: AssistantResponse;
  isInitialStatus: boolean;
}

export const InitialState: State = {
  assistantResponse: {
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
  },
  isInitialStatus: true,
}

// const assistantResponse: AssistantResponse = {
//   ticket: {
//     tenant: '',
//     matchedProperty: '',
//     landlord: '',
//     category: '',
//     issue: '',
//     likelyCause: '',
//   },
//   leaseAgreementReview: {
//     importantContractObligations: '',
//     resolutionResponsibility: '',
//   },
//   recommendedSolution: '',
//   recommendedSuppliers: [],
//   insufficientInformation: false
// }

const ticketReducer = createReducer(
  InitialState,
  on(TicketActions.saveTicket, (state, { payload }) => ({
    ...state,
    isInitialStatus: false,
    assistantResponse: payload,
    // ticket: payload.ticket,
    // leaseAgreementReview: payload.leaseAgreementReview,
    // recommendedSolution: payload.recommendedSolution,
    // recommendedSuppliers: payload.recommendedSuppliers,
    // insufficientInformation: payload.insufficientInformation,
  }))
);

export const ticketFeature = createFeature({
  name: 'ticket',
  reducer: ticketReducer,
  extraSelectors: ({selectTicketState}) => ({
    selectCurrentTicket: createSelector(selectTicketState, (ticket) => ticket )
  })
})

export const {
  name,
  reducer,
  selectTicketState,
  selectCurrentTicket
} = ticketFeature
