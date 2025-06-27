import { EventMessageLog, MessageLog } from '../models/messageLog';
import { FlowCoordinator, FlowStep, Step } from '../models/step';
import { ProcessIssueResponse } from './models/ProcessIssue';

export class LogService {
  static issueToEventMessageLog(req: ProcessIssueResponse): EventMessageLog {
    const step = FlowCoordinator.issueRequestStep;
    return {
      task: step.task,
      response: req.response,
      deliveryTime: req.time,
      nextStep: Step.Next,
      step: step
    };
  }

  static toEventMessageLog(response: string, time: string, step: FlowStep, nextStep?: Step): EventMessageLog {
    return {
      task: step.task,
      response: response,
      deliveryTime: time,
      step: step,
      nextStep: nextStep ?? Step.Next,
    };
  }

  static LogEventMessage(title: string, response: string, time: string): EventMessageLog {
    return {
      task: title,
      response: response,
      deliveryTime: time,
      step: FlowCoordinator.GenericStep,
      nextStep: Step.Next,
    };
  }

  static LogMessage(message: string, time: string, isIncoming: boolean = false): MessageLog {
    return {
      isIncoming: isIncoming,
      response: message,
      deliveryTime: time,
      nextStep: Step.Next
    };
  }

  static toMessageLog(eventMessage: EventMessageLog, isIncoming: boolean = false): MessageLog {
    return {
      isIncoming: isIncoming,
      response: eventMessage.response,
      deliveryTime: eventMessage.deliveryTime,
      nextStep: eventMessage.nextStep
    };
  }
}
