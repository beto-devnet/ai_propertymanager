import {FormControl} from '@angular/forms';

export interface AssistantRequest
{
  issueDescription: string;
}

export interface AssistantResponse
{
  ticket: Ticket
  leaseAgreementReview: LeaseAgreementReview,
  recommendedSolution: string;
  recommendedSuppliers: Supplier[];
  insufficientInformation: boolean
}

export interface Ticket {
  tenant: string;
  matchedProperty: string;
  landlord: string;
  category: string;
  issue: string;
  likelyCause: string;
}

export interface LeaseAgreementReview {
  importantContractObligations: string;
  resolutionResponsibility: string;
}

export interface Supplier {
  name: string;
  category: string;
  descriptionOfServices: string;
}


export interface IssueDescriptorForm {
  issue: FormControl<string>;
}
