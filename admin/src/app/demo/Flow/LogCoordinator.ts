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

// export interface AnalyzeMessage extends SimpleMessage {
//   title: string;
//   from: RoleType;
//   isInput: true;
// }

export interface NodeLog {
  title: string;
  from: RoleType;
  message: string;
  time: string;
  // isNodeLog: boolean;
  // isInput: boolean;
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
  title: string;
  renderType: StepNodeType.Waiting;
}

export interface NodeMessageLog extends RenderMessageBase {
  title: string;
  steps: NodeLog[];
  renderType: StepNodeType.Node;
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

  static renderWaitingMessage(title: string, message: string): WaitingMessageLog {
    return {
      message: message,
      title: title,
      deliveryTime: format(new Date(), 'MM-dd HH:mm'),
      renderType: StepNodeType.Waiting
    }
  }

  static renderNodeMessage(title: string, message: string, messages: NodeLog[]): NodeMessageLog {
    return {
      title: title,
      message: message,
      steps: messages,
      deliveryTime: format(new Date(), 'MM-dd HH:mm'),
      renderType: StepNodeType.Node
    }
  }

  static renderAnalyzeMessage(title: string, message: string): NodeLog {
    return {
      title: title,
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
      from: 'Aimee',
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
