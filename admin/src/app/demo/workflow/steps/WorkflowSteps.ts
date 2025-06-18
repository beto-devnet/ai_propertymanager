import { inject } from '@angular/core';
import { MessageComposer } from '../../MessageComposer';
import { IssueRequest } from '../../models/issueRequest';
import { IssueResponse } from '../../models/issueResponse';
import { IWorkflowResult, IWorkflowStep, IWorkflowStep2, WorkflowContext, WorkflowResult } from '../WorkflowContext';
import {
  ServiceAvailabilityMessageRequest, ServiceAvailabilityMessageResponse,
  ServiceAvailabilityRequest,
  ServiceAvailabilityResponse, VendorAvailabilityResponse
} from '../../models/tenant.models';


export class StepBase<Type> {
  protected _context: WorkflowContext<Type>;

  constructor(context: WorkflowContext<Type>) {
    this._context = context;
  }
}

export class TenantRequest extends StepBase<IssueRequest> implements IWorkflowStep<IssueResponse> {
  constructor(context: WorkflowContext<IssueRequest>, private messageComposer: MessageComposer) {
    super(context);
  }

  async execute(): Promise<IWorkflowResult<IssueResponse>> {
    const request: IssueRequest = this._context.GetContext;
    const issueResponse: IssueResponse | Error = await this.messageComposer.issueRequest(request.IssueDescription, request.User);
    if(issueResponse instanceof Error) {
      return WorkflowResult.fail<IssueResponse>("Failed on Issue request");
    }

    return WorkflowResult.success<IssueResponse>("Issue request processed", issueResponse);
  }
}

export class ContactToVendorStep extends StepBase<ServiceAvailabilityMessageRequest> implements IWorkflowStep<ServiceAvailabilityMessageResponse> {

  constructor(context: WorkflowContext<ServiceAvailabilityMessageRequest>, private messageComposer: MessageComposer) {
    super(context);
  }

  async execute(): Promise<IWorkflowResult<ServiceAvailabilityMessageResponse>> {
      const request = this._context.GetContext;
      const result  = await this.messageComposer.serviceAvailabilityMessage(request);

    if(result === null) {
      return WorkflowResult.fail<ServiceAvailabilityMessageResponse>("Failed on get message to request a service to the vendor");
    }

    return WorkflowResult.success<ServiceAvailabilityMessageResponse>("Issue request processed", result);
  }
}

export class VendorAvailabilityResponseStep extends StepBase<any> implements IWorkflowStep<VendorAvailabilityResponse> {

  constructor(context: WorkflowContext<any>, private messageComposer: MessageComposer) {
    super(context);
  }

  async execute(): Promise<IWorkflowResult<VendorAvailabilityResponse>> {
    const result: VendorAvailabilityResponse | null  = await this.messageComposer.getVendorAvailabilityResponse();

    if(result === null) {
      return WorkflowResult.fail<VendorAvailabilityResponse>("Failed to get vendor response");
    }

    return WorkflowResult.success<VendorAvailabilityResponse>("Vendor response successfully", result);
  }
}


export class SendMessage<TInput, TOutput> extends StepBase<TInput> implements IWorkflowStep2<TOutput> {

  constructor(context: WorkflowContext<TInput>) {
    super(context);
  }

  async execute(fn: any): Promise<IWorkflowResult<TOutput>> {
    const request = this._context.GetContext;
    const result: TOutput  = await fn(request);

    if(result === null) {
      return WorkflowResult.fail<TOutput>("Failed on get message to request a service to the vendor");
    }

    return WorkflowResult.success<TOutput>("Issue request processed", result);
  }
}

export class ReceiveMessage<TInput,TOutput> extends StepBase<TInput> implements IWorkflowStep2<TOutput> {

  constructor(context: WorkflowContext<TInput>) {
    super(context);
  }

  async execute(fn: any): Promise<IWorkflowResult<TOutput>> {
    const request = this._context.GetContext;
    const result: TOutput  = await fn(request);

    if(result === null) {
      return WorkflowResult.fail<TOutput>("Failed on get message to request a service to the vendor");
    }

    return WorkflowResult.success<TOutput>("Issue request processed", result);
  }
}
