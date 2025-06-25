import { InitiatorType } from './Step';

export interface Message {
  content: string;
  time: string;
  from: InitiatorType;
}

export interface HistoryMessage {
  time: string;
  from: InitiatorType;
  response: string;
}

export interface LogErrorMessage {
  time: string;
  errorMessage: string;
  title: string;
}

export interface IssueMessage {
  time: string;
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  issueDescription: string;
  category: string;
}

export class LogCoordinator {

  private historyLog: Array<Message | HistoryMessage | LogErrorMessage | IssueMessage> = [];


  getLogs(): Array<Message | HistoryMessage | LogErrorMessage | IssueMessage> {
    return this.historyLog;
  }

  LogSimpleMessage(message: Message): void {
  }

  LogHistoryMessage(message: HistoryMessage): void {
  }

  LogIssueRequest(issue: IssueMessage): void {

  }

  LogError(error: LogErrorMessage): void {

  }
}
