export enum Step {
  Next,
  Waiting,
  ResponseToTenant,
  ResponseToVendor,
  VendorToAime ,
  TenantToAimee,

  LogIssue,
  SelectAndContactVendor,
  VendorResponseAvailability,
  WaitingVendorScheduleVisit,
  VendorConfirmVisit,
  WaitingVendorConfirmIssueFixed,
  VendorConfirmIssueFixed,

  TenantConfirmIssueFixed
}

export type originType = 'Tenant' | 'Vendor' | 'Aimee';

export interface FlowStep {
  task: string;
  step: Step,
  sender: originType;
  receiver: originType;
  nextStep?: string;
}


export class FlowCoordinator {
  static ResponseToTenant: FlowStep = { task: 'Response to Tenant', step: Step.ResponseToTenant, sender: 'Aimee', receiver: 'Tenant' };
  static ResponseToVendor: FlowStep = { task: 'Response to Vendor', step: Step.ResponseToTenant, sender: 'Aimee', receiver: 'Vendor' };
  static SelectingVendor: FlowStep = { task: 'Vendor Selected', step: Step.Next, sender: "Aimee", receiver: 'Aimee' };

  static VendorResponseToAimee: FlowStep = { task: 'Vendor Response to Aimme', step: Step.VendorToAime, sender: 'Tenant', receiver: 'Aimee' };

  static issueRequestStep: FlowStep = { task: 'Tenant Request', step: Step.LogIssue, sender: 'Aimee', receiver: 'Tenant' };
  static GetVendor: FlowStep = { task: 'Contact Vendor', step: Step.SelectAndContactVendor, sender: 'Aimee', receiver: 'Vendor' };
  static WaitingVendorAvailability: FlowStep = { task: 'Waiting for vendor availability', step: Step.WaitingVendorScheduleVisit, sender: 'Aimee', receiver: 'Aimee' };
  static VendorAvailabilityResponse: FlowStep = { task: 'Get Vendor Availability', step: Step.VendorResponseAvailability, sender: 'Vendor', receiver: 'Aimee', nextStep: 'Inform tenant about tenant contact' };
  static WaitingVendor: FlowStep = { task: 'Waiting for vendor to confirm visit time', step: Step.WaitingVendorScheduleVisit, sender: 'Aimee', receiver: 'Vendor' };
  static VendorConfirmVisit: FlowStep = { task: 'Vendor Confirm Visit to Tenant', step: Step.VendorConfirmVisit, sender: 'Vendor', receiver: 'Aimee' };
  static WaitingVendorConfirmIssueFixed: FlowStep = { task: 'Waiting for vendor to confirm issue has fixed', step: Step.WaitingVendorConfirmIssueFixed, sender: 'Aimee', receiver: 'Vendor' };
  static VendorConfirmIssueFixed: FlowStep = { task: 'Vendor Confirm Issue has fixed', step: Step.VendorConfirmIssueFixed, sender: 'Vendor', receiver: 'Aimee' };

  static WaitingTenantToConfirmIssueFixed: FlowStep = { task: 'Wating Tenant Confirm Issue has fixed', step: Step.TenantConfirmIssueFixed, sender: 'Aimee', receiver: 'Tenant' };
}
