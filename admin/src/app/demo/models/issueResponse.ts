import { MessageResponseBase } from './MessageResponse';

export interface IssueResponse extends MessageResponseBase {
  category: string;
  issue: string;
  tenantName: string;
  phone: string;
  address: string;
  nextStep: string;
}
