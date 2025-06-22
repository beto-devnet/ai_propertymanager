import { IStep } from './IStep';
import { Err, Ok, Result } from 'ts-results';
import { ErrorStepResult } from './ErrorStepResult';
import { ProcessIssueRequest, ProcessIssueResponse } from '../models/ProcessIssue';
import { StepBase } from './StepBase';
import { firstValueFrom } from 'rxjs';
import { UpdateService } from '../update.service';
import { SendMessageRequest } from '../models/SendMessageRequest';
import { AskForAvailability, AskForAvailabilityResponse } from '../models/AskForAvailability';
import { ReceiveMessageRequest } from '../models/ReceiveMessageRequest';
import { VendorMessageAvailabilityResponse } from '../models/VendorMessageAvailabilityResponse';
import {
  InformTenantContactFromVendor,
  InformTenantContactFromVendorResponse
} from '../models/InformTenantContactFromVendor';
import { VendorScheduledVisitTimeResponse } from '../models/VendorScheduledVisitTime';
import { VendorConfirmedIssueWasFixedResponse } from '../models/VendorConfirmedIssueWasFixedResponse';
import { TenantConfirmedIssueWasFixedResponse } from '../models/TenantConfirmedIssueWasFixedResponse';

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

export class VendorSendMessageStep extends StepBase implements IStep<ReceiveMessageRequest, VendorMessageAvailabilityResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: ReceiveMessageRequest): Promise<Result<VendorMessageAvailabilityResponse, ErrorStepResult>> {

    const sub = this.service.receiveMessage(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}

export class TenantSendMessageStep extends StepBase implements IStep<SendMessageRequest<InformTenantContactFromVendor>, InformTenantContactFromVendorResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: SendMessageRequest<InformTenantContactFromVendor>): Promise<Result<InformTenantContactFromVendorResponse, ErrorStepResult>> {

    const sub = this.service.sendMessageGeneric<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}

export class VendorScheduledTimeForVisitWithTenant extends StepBase implements IStep<ReceiveMessageRequest, VendorScheduledVisitTimeResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: ReceiveMessageRequest): Promise<Result<VendorScheduledVisitTimeResponse, ErrorStepResult>> {

    const sub = this.service.receiveMessageGeneric<VendorScheduledVisitTimeResponse>(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}

export class VendorConfirmedIssueWasFixed extends StepBase implements IStep<ReceiveMessageRequest, VendorConfirmedIssueWasFixedResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: ReceiveMessageRequest): Promise<Result<VendorConfirmedIssueWasFixedResponse, ErrorStepResult>> {

    const sub = this.service.receiveMessageGeneric<VendorConfirmedIssueWasFixedResponse>(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}

export class TenantConfirmedIssueWasFixed extends StepBase implements IStep<ReceiveMessageRequest, TenantConfirmedIssueWasFixedResponse> {
  protected service: UpdateService;

  constructor(service: UpdateService) {
    super();
    this.service = service;
  }

  async run(request: ReceiveMessageRequest): Promise<Result<TenantConfirmedIssueWasFixedResponse, ErrorStepResult>> {

    const sub = this.service.receiveMessageGeneric<TenantConfirmedIssueWasFixedResponse>(request);
    const result = await firstValueFrom(sub);

    if(result.isError) {
      return new Err(result.error!);
    }

    return new Ok(result.data!);
  }
}
