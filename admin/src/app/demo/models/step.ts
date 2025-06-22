export enum Step {
  Next,
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
  VendorConfirmIssueFixed
}

export type originType = 'Tenant' | 'Vendor' | 'Aimee';

export interface FlowStep {
  task: string
  step: Step,
  sender: originType;
  receiver: originType;
}


export class FlowCoordinator {
  static ResponseToTenant: FlowStep = { task: 'Response to Tenant', step: Step.ResponseToTenant, sender: 'Aimee', receiver: 'Tenant' };
  static ResponseToVendor: FlowStep = { task: 'Response to Vendor', step: Step.ResponseToTenant, sender: 'Aimee', receiver: 'Vendor' };

  static VendorResponseToAimee: FlowStep = { task: 'Vendor Response to Aimme', step: Step.VendorToAime, sender: 'Tenant', receiver: 'Aimee' };

  static issueRequestStep: FlowStep = { task: 'Tenant Request', step: Step.LogIssue, sender: 'Aimee', receiver: 'Tenant' };
  static GetVendor: FlowStep = { task: 'Select and Contact Vendor', step: Step.SelectAndContactVendor, sender: 'Aimee', receiver: 'Vendor' };
  static VendorAvailabilityResponse: FlowStep = { task: 'Vendor Availability Response', step: Step.VendorResponseAvailability, sender: 'Vendor', receiver: 'Aimee' };
  static WaitingVendor: FlowStep = { task: 'Waiting for vendor to confirm visit time', step: Step.WaitingVendorScheduleVisit, sender: 'Aimee', receiver: 'Vendor' };
  static VendorConfirmVisit: FlowStep = { task: 'Vendor Confirm Visit to Tenant', step: Step.VendorConfirmVisit, sender: 'Vendor', receiver: 'Aimee' };
  static WaitingVendorConfirmIssueFixed: FlowStep = { task: 'Waiting for vendor to confirm issue has fixed', step: Step.WaitingVendorConfirmIssueFixed, sender: 'Aimee', receiver: 'Vendor' };
  static VendorConfirmIssueFixed: FlowStep = { task: 'Vendor Confirm Issue has fixed', step: Step.VendorConfirmIssueFixed, sender: 'Vendor', receiver: 'Aimee' };
}
