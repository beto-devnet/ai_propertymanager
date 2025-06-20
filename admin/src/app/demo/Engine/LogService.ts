import { EventMessageLog, MessageLog } from '../models/messageLog';
import { Step } from '../models/step';
import { ProcessIssueResponse } from './models/ProcessIssue';

export class LogService {
  static issueToEventMessageLog(req: ProcessIssueResponse): EventMessageLog {
    return {
      task: 'Categorize the tenant issue',
      response: req.response,
      deliveryTime: req.time,
      nextStep: Step.Next,
    };
  }

  static toEventMessageLog(task: string, response: string, time: string, nextStep?: Step): EventMessageLog {
    return {
      task: task,
      response: response,
      deliveryTime: time,
      nextStep: nextStep ?? Step.Next,
    };
  }

  toMessageLog(eventMessage: EventMessageLog, isIncoming: boolean = false): MessageLog {
    return {
      isIncoming: isIncoming,
      response: eventMessage.response,
      deliveryTime: eventMessage.deliveryTime,
      nextStep: eventMessage.nextStep
    };
  }
}
