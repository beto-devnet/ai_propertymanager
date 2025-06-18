import { Step } from './step';

export interface MessageLog {
  isIncoming: boolean;
  response: string;
  deliveryTime: string;
  nextStep: Step;
}

export interface EventMessageLog {
  task: string;
  response: string;
  deliveryTime: string;
  nextStep: Step;
}
