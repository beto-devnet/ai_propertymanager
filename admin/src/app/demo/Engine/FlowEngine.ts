import { ProcessIssueStep, SendMessageStep } from './Step/ProcessIssueStep';
import { FlowEngineResponse } from "./FlowEngineResponse";
import { ProcessIssueRequest, ProcessIssueResponse } from './models/ProcessIssue';
import { UpdateService } from './update.service';
import { SendMessageRequest } from './models/SendMessageRequest';
import { AskForAvailability, AskForAvailabilityResponse } from './models/AskForAvailability';

export class FlowEngine {
  private processIssueStep: ProcessIssueStep;
  private sendMessageStep: SendMessageStep;

  constructor(service: UpdateService) {
    this.processIssueStep = new ProcessIssueStep(service);
    this.sendMessageStep = new SendMessageStep(service);
  }

  async processIssue(req: ProcessIssueRequest): Promise<FlowEngineResponse<ProcessIssueResponse>> {
    let response: FlowEngineResponse<ProcessIssueResponse> = { isError: false };

    const stepResult = await this.processIssueStep.run(req)
    if(stepResult.err) {
      response.isError = true;
      response.error = stepResult.val;
      return response;
    }

    response.isError = false;
    response.data
    return response;
  }

  async askForAvailability(req: SendMessageRequest<AskForAvailability>): Promise<FlowEngineResponse<AskForAvailabilityResponse>> {
    let flowResponse: FlowEngineResponse<AskForAvailabilityResponse> = { isError: false };

    const stepResult = await this.sendMessageStep.run(req);
    if(stepResult.err) {
      flowResponse.isError = true;
      flowResponse.error = stepResult.val;
      return flowResponse;
    }

    flowResponse.isError = false;
    flowResponse.data = stepResult.val;
    return flowResponse;
  }

  async processStep<T>(req: any): Promise<FlowEngineResponse<T>> {
    let result: FlowEngineResponse<T> = { isError: false };

    const stepResult = await this.processIssueStep.run(req);
    if(stepResult.err) {
      result.isError = true;
      result.error = stepResult.val;
      return result;
    }

    result.data = <T>stepResult.val;
    return result;
  }
}
