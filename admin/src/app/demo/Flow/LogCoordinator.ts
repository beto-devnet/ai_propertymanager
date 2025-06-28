import { RoleType, StepNodeType } from './Step';
import { format } from 'date-fns';
import { ProcessIssueResponse } from '../Engine/models/ProcessIssue';

export interface SimpleMessage {
  message: string;
  time: string;
  isInput: boolean;
}

export interface InputMessage extends SimpleMessage {
  from: RoleType;
}

export interface OutputMessage extends SimpleMessage {
  to: RoleType;
}


export type LogsMessageType = Array<InputMessage | OutputMessage>;

export interface RenderMessageBase {
  message: string;
  deliveryTime: string;
  renderType: StepNodeType;
}

export interface IssueMessage extends RenderMessageBase {
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  issueDescription: string;
  category: string;
  message: string;
  deliveryTime: string;
  readonly renderType: StepNodeType.Issue;
}

export interface EventMessageLog extends RenderMessageBase {
  title: string;
  message: string;
  deliveryTime: string;
  renderType: StepNodeType.Information;
}

export interface WaitingMessageLog extends RenderMessageBase {
  renderType: StepNodeType.Waiting;
}

export class RenderMessage {
  static renderIssueMessage(issue: ProcessIssueResponse): IssueMessage {
    return {
      tenantName: issue.tenantName,
      tenantAddress: issue.address,
      tenantPhone: issue.phone,
      issueDescription: issue.issue,
      category: issue.category,
      message: issue.response,
      deliveryTime: format(new Date(issue.time), 'MM-dd HH:mm'),
      renderType: StepNodeType.Issue
    }
  }

  static renderEventMessage(title: string, message: string): EventMessageLog {
      return {
        title: title,
        message: message,
        deliveryTime: format(new Date(), 'MM-dd HH:mm'),
        renderType: StepNodeType.Information
      }
  }

  static renderWaitingMessage(message: string): WaitingMessageLog {
    return {
      message: message,
      deliveryTime: format(new Date(), 'MM-dd HH:mm'),
      renderType: StepNodeType.Waiting
    }
  }

  static renderInputMessageLog(message: string, time: string): SimpleMessage {
    return {
      isInput: true,
      message: message,
      time: time,
    }
  }

  static renderOutputMessageLog(message: string, time: string): SimpleMessage {
    return {
      isInput: false,
      message: message,
      time: time,
    }
  }
}
