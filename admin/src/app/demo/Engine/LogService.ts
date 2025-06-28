import { EventMessageLog, MessageLog } from '../models/messageLog';
import { FlowCoordinator, Step } from '../models/step';

export class LogService {

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
}
