import { RoleType } from './Step';
import { format } from 'date-fns';

export interface SimpleMessage {
  message: string;
  time: string;
}

export interface InputMessage extends SimpleMessage {
  from: RoleType;
  inputMessage: boolean;
}

export interface OutputMessage extends SimpleMessage {
  to: RoleType;
  outputMessage: boolean;
}

export interface AimeeLogMessage extends SimpleMessage {
  sendTo: RoleType;
  title: string;
  logMessage: boolean;
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


export type LogsMessageType = Array<InputMessage | OutputMessage | AimeeLogMessage | LogErrorMessage | IssueMessage>;

export class LogCoordinator {

  private historyLog: LogsMessageType = [];


  getLogs(): LogsMessageType {
    return this.historyLog;
  }

  constructor() {
    this.historyLog = [];
  }

  resetLogs(): void {
    this.historyLog = [];
  }

  LogInputMessage(from: RoleType, message: string): void  {
    const logMessage: InputMessage = {
      time: format(new Date(), 'MM-dd HH:mm'),
      from: from,
      message: message,
      inputMessage: true
    };

    this.historyLog.push(logMessage);
  }

  LogOutputMessage(to: RoleType, message: string): void {
    const logMessage: OutputMessage = {
      time: format(new Date(), 'MM-dd HH:mm'),
      to: to,
      message: message,
      outputMessage: true
    };
    this.historyLog.push(logMessage);
  }

  LogAimeeMessage(title: string, message: string, sendTo: RoleType = 'Aimee' ): void {
    const logMessage: AimeeLogMessage = {
      time: format(new Date(), 'MM-dd HH:mm'),
      sendTo: sendTo,
      title: title,
      message: message,
      logMessage: true
    };

    this.historyLog.push(logMessage);
  }

  LogIssueRequest(tenantName: string, tenantAddress: string, tenantPhone: string, issueDescription: string, category: string,): void {
    const issueMessage: IssueMessage = {
      time: format(new Date(), 'MM-dd HH:mm'),
      tenantName: tenantName,
      tenantAddress: tenantAddress,
      tenantPhone: tenantPhone,
      issueDescription: issueDescription,
      category: category,
    };

    this.historyLog.push(issueMessage);
  }

  LogError(message: string, title?: string): void {
    const logMessage: LogErrorMessage = { time: format(new Date(), 'MM-dd HH:mm'), errorMessage: message, title: title || 'Error'};
    this.historyLog.push(logMessage);
  }
}
