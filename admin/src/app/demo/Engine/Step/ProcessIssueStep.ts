import { IStep } from './IStep';
import { Err, Ok, Result } from 'ts-results';
import { ErrorStepResult } from './ErrorStepResult';
import { ProcessIssueRequest, ProcessIssueResponse } from '../models/ProcessIssue';
import { StepBase } from './StepBase';
import { firstValueFrom } from 'rxjs';
import { UpdateService } from '../update.service';
import { SendMessageRequest } from '../models/SendMessageRequest';
import { AskForAvailability, AskForAvailabilityResponse } from '../models/AskForAvailability';

export class ProcessIssueStep extends StepBase implements IStep<ProcessIssueRequest, ProcessIssueResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: ProcessIssueRequest): Promise<Result<ProcessIssueResponse, ErrorStepResult>> {

    const sub = this.service.processIssue(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}

export class SendMessageStep extends StepBase implements IStep<SendMessageRequest<AskForAvailability>, any> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: SendMessageRequest<AskForAvailability>): Promise<Result<AskForAvailabilityResponse, ErrorStepResult>> {

    const sub = this.service.sendMessage(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}
