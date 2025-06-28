export enum Step {
  Next,
  Waiting,
  LogIssue,
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
  static GenericStep: FlowStep = { task: 'Generic', step: Step.Next, sender: 'Aimee', receiver: 'Tenant' };
}
