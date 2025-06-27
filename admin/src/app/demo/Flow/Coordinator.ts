import { DataNode, StepList, StepMark, StepNode, StepNodeResult } from './Step';
import { ProcessIssueRequest, ProcessIssueResponse } from '../Engine/models/ProcessIssue';
import { Tenant } from '../models/Tenant';
import { inject } from '@angular/core';
import { UpdateService } from '../Engine/update.service';
import { firstValueFrom } from 'rxjs';
import { LogCoordinator, LogsMessageType } from './LogCoordinator';
import { Vendor } from '../models/vendor.model';
import { AskForAvailability, AskForAvailabilityResponse } from '../Engine/models/AskForAvailability';
import { SendMessageRequest } from '../Engine/models/SendMessageRequest';
import { ReceiveMessageRequest } from '../Engine/models/ReceiveMessageRequest';
import { VendorAvailabilityResponse } from '../models/tenant.models';
import {
  InformTenantContactFromVendor,
  InformTenantContactFromVendorResponse
} from '../Engine/models/InformTenantContactFromVendor';
import { VendorScheduledVisitTimeResponse } from '../Engine/models/VendorScheduledVisitTime';
import { format } from 'date-fns';
import { VendorConfirmedIssueWasFixedResponse } from '../Engine/models/VendorConfirmedIssueWasFixedResponse';
import { TenantConfirmedIssueWasFixedResponse } from '../Engine/models/TenantConfirmedIssueWasFixedResponse';

export interface CoordinatorStepResponse<T> {
  logs: LogsMessageType;
  isError?: boolean;
  response?: T | null
}

export class Coordinator {
  private steps: StepList;
  private tenant!: Tenant;
  private log!: LogCoordinator;
  private service: UpdateService = inject(UpdateService);

  constructor() {
    this.steps = new StepList();
     this.log = new LogCoordinator();
  }

  set Tenant(tenant: Tenant) {
    this.tenant = tenant;
  }

  get LastRequestFromAimeeToVendor(): StepNode<any, any> | null {
    let lastStep: StepNode<any, any> = new StepNode<any, any>('Aimee', null, null, []);
    this.steps.getSteps().forEach(step => {
      if(step.mark === StepMark.WaitingVendorAvailabilityReply || step.mark === StepMark.WaitingVendorScheduleVisit || step.mark === StepMark.WaitingVendorConfirmIssueFixed) {
        lastStep = step;
      }
    });

    return lastStep;
  }

  get LastRequestFromAimeeToTenant(): StepNode<any, any> | null {
    let lastStep: StepNode<any, any> = new StepNode<any, any>('Aimee', null, null, []);
    this.steps.getSteps().forEach(step => {
      if(step.mark === StepMark.WaitingTenantConfirmIssueFixed) {
        lastStep = step;
      }
    });

    return lastStep;
  }

  async createIssue(issue: ProcessIssueRequest): Promise<StepNodeResult<ProcessIssueRequest,ProcessIssueResponse>> {
    const stepData: DataNode<ProcessIssueRequest> = { title: 'Tenant Request', content: '', data: issue };

    const result = await firstValueFrom(this.service.processIssue(issue));

    if(result.isError) {
    //   return this.handleError<ProcessIssueRequest, ProcessIssueResponse>('Vendor', stepData);
    }

    const stepResponse = result.data!;

    const { name, address, phone, id } = this.tenant;
    this.log.LogIssueRequest(name, address, phone, issue.IssueDescription, result.data?.category!);
    this.log.LogOutputMessage('Tenant', result.data?.response!);

    this.steps.addStep<ProcessIssueRequest, ProcessIssueResponse>('Vendor', stepData, stepResponse, this.log.getLogs());
    return this.steps.getLastStep<ProcessIssueRequest, ProcessIssueResponse>();
  }

  async selectVendorBasedOnCategory(categoryName: string): Promise<StepNodeResult<string, Vendor>> {
    this.log.resetLogs();
    const vendor = await firstValueFrom(this.service.getVendor(categoryName));

    const vendorName = vendor.contacts[0].name;
    const data: DataNode<string> = { title: 'Vendor Selection', data: categoryName, content: `The Vendor selected is ${vendorName} from ${vendor.companyName}`}

    this.log.LogAimeeMessage(data.title, data.content);

    this.steps.addStep<string, Vendor>('Aimee', data, vendor, this.log.getLogs());
    return this.steps.getLastStep<string, Vendor>();
  }

  async AskForAvailability(categoryName: string, vendorId: number, issue: string): Promise<StepNodeResult<AskForAvailability, AskForAvailabilityResponse>> {
    this.log.resetLogs();
    const request: AskForAvailability = {
      UserId: this.tenant.id,
      Category:  categoryName,
      VendorId: vendorId,
      Issue: issue,
    };
    const messageReq: SendMessageRequest<AskForAvailability> = { toVendorId: this.tenant.id, request: request, step: 'ask for availability' };
    const stepResult = await firstValueFrom(this.service.sendMessage(messageReq))

    if(stepResult.isError) {}

    const stepData: DataNode<AskForAvailability> = { title: 'Ask for Availability', content: stepResult.data?.message!, data: request };

    this.log.LogAimeeMessage(stepData.title, stepData.content, 'Vendor');
    this.log.LogOutputMessage('Vendor', stepData.content);

    this.steps.addStep<AskForAvailability, AskForAvailabilityResponse>('Aimee', stepData, stepResult.data!, this.log.getLogs());
    return this.steps.getLastStep();
  }


  waitForVendorAvailabilityReply(): StepNodeResult<string, null> {
    this.log.resetLogs();

    const data: DataNode<string> = { title: 'Waiting for Vendor Reply', content: `Waiting for vendor to reply`, data: '' };

    this.log.LogAimeeMessage(data.title, data.content, 'Vendor');

    this.steps.addStep<string, null>('Aimee', data, null, this.log.getLogs(), StepMark.WaitingVendorAvailabilityReply);
    return this.steps.getLastStep<string, null>();
  }

  waitForVendorConfirmVisit(): StepNodeResult<string, null> {
    this.log.resetLogs();

    const data: DataNode<string> = { title: 'Waiting for Vendor To confirm visit', content: `Waiting for vendor to confirm the date and time to schedule a visit with the tenant`, data: '' };

    this.log.LogAimeeMessage(data.title, data.content, 'Aimee');

    this.steps.addStep<string, null>('Aimee', data, null, this.log.getLogs(), StepMark.WaitingVendorScheduleVisit);
    return this.steps.getLastStep<string, null>();
  }

  async InformTenantAboutContactWithVendor(vendorId: number): Promise<StepNodeResult<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>> {
    this.log.resetLogs();

    const request: InformTenantContactFromVendor = { vendorId: vendorId, tenantId: this.tenant.id };
    const messageRequest: SendMessageRequest<InformTenantContactFromVendor> = { toTenantId: this.tenant.id, step: 'Response to Tenant', request };
    const result = await firstValueFrom(this.service.sendMessageGeneric<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>(messageRequest));

    if(result.isError) {}

    const data: DataNode<InformTenantContactFromVendor> = { title: 'Inform Tenant', content: 'Inform Tenant that vendor will be reaching out', data: request };


    this.log.LogAimeeMessage(data.title, result.data?.message!);
    this.log.LogOutputMessage('Tenant', result.data?.message!);

    this.steps.addStep<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>('Aimee', data, result.data!, this.log.getLogs());
    return this.steps.getLastStep<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>();
  }

  async vendorReplyAvailability(vendorId: number, vendorReplyMessage: string): Promise<StepNodeResult<Vendor, VendorAvailabilityResponse>> {
    this.log.resetLogs();

    const receiveMessage: ReceiveMessageRequest = { fromVendorId: vendorId, messageToAime:  vendorReplyMessage, step: 'availability response', aimeeMessage: '' };
    const vendorReply = await firstValueFrom(this.service.receiveMessage(receiveMessage));
    if(vendorReply.isError) {}

    const data: DataNode<VendorAvailabilityResponse> = { title: 'Vendor availability reply', content: vendorReply.data?.message!, data: vendorReply.data! };

    this.log.LogInputMessage('Vendor', vendorReplyMessage);
    this.log.LogAimeeMessage(data.title, vendorReplyMessage);
    this.log.LogAimeeMessage(data.title, vendorReply.data?.message!);

    this.steps.addStep<unknown, VendorAvailabilityResponse>('Vendor', data, vendorReply.data!, this.log.getLogs());

    return this.steps.getLastStep<Vendor, VendorAvailabilityResponse>();
  }

  async vendorConfirmScheduledVisit(vendorId: number, vendorName: string, vendorCompany: string, vendorMessage: string): Promise<StepNodeResult<string, VendorScheduledVisitTimeResponse>> {
    this.log.resetLogs();

    const request: ReceiveMessageRequest = { fromVendorId: vendorId, step: 'Vendor Confirm Visit to Tenant', aimeeMessage: '', messageToAime: vendorMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<VendorScheduledVisitTimeResponse>(request));
    if(result.isError) {}

    const stepData: DataNode<string> = { title: 'Vendor Scheduled Visit', content: 'Vendor confirm a date and time visit with tenant', data: vendorMessage };

    this.log.LogInputMessage('Vendor', vendorMessage);
    this.log.LogAimeeMessage(stepData.title, stepData.content);

    const date = Date.parse(`${result.data?.scheduleDate!} ${result.data?.scheduleTime!}`);
    const dateFormatted = format(new Date(date), "eeee, dd 'at' HH:mm" );
    const messageToTenant = `Hi ${this.tenant.name}. Quick update.
    ${vendorName} from ${vendorCompany} has confirmed a date and time to visit your home by ${dateFormatted}.`
    this.log.LogOutputMessage('Tenant', messageToTenant);

    this.steps.addStep<string, VendorScheduledVisitTimeResponse>('Vendor', stepData, result.data! , this.log.getLogs());
    return this.steps.getLastStep();
  }

  waitForVendorConfirmIssueFix(): StepNodeResult<string, null> {
    this.log.resetLogs();

    const data: DataNode<string> = { title: 'Waiting for Vendor To confirm Issue Fixed', content: `Waiting for vendor to confirm the that the issue was successfully fixed`, data: '' };

    this.log.LogAimeeMessage(data.title, data.content, 'Aimee');

    this.steps.addStep<string, null>('Aimee', data, null, this.log.getLogs(), StepMark.WaitingVendorConfirmIssueFixed);
    return this.steps.getLastStep<string, null>();
  }

  async vendorConfirmIssueFixed(vendorId: number, vendorMessage: string): Promise<StepNodeResult<string, VendorConfirmedIssueWasFixedResponse>> {
    this.log.resetLogs();

    const request: ReceiveMessageRequest = { fromVendorId: vendorId, step: 'Vendor Confirm Issue Fixed', aimeeMessage: '', messageToAime: vendorMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<VendorConfirmedIssueWasFixedResponse>(request));
    if(result.isError) {}

    const stepData: DataNode<string> = { title: 'Vendor Confirm Issue was Fixed', content: result.data?.message!, data: vendorMessage };

    this.log.LogInputMessage('Vendor', vendorMessage);
    this.log.LogAimeeMessage(stepData.title, stepData.content);

    this.steps.addStep<string, null>('Vendor', stepData, null, this.log.getLogs());
    return this.steps.getLastStep<string, null>();
  }

  waitForTenantConfirmIssueFix(vendorName: string, vendorCompany: string): StepNodeResult<string, null> {
    this.log.resetLogs();

    const data: DataNode<string> = { title: 'Waiting for Vendor To confirm Issue Fixed', content: `Waiting for vendor to confirm the that the issue was successfully fixed`, data: '' };

    this.log.LogAimeeMessage(data.title, data.content, 'Aimee');

    const msg = `Hi, ${this.tenant.name}. Looks like ${vendorName} from ${vendorCompany} has fixed the issue. Can you confirm that we can close the ticket?`;
    this.log.LogOutputMessage('Tenant', msg);

    this.steps.addStep<string, null>('Aimee', data, null, this.log.getLogs(), StepMark.WaitingTenantConfirmIssueFixed);
    return this.steps.getLastStep<string, null>();
  }

  async confirmWithTenantIssueFixed(tenantMessage: string): Promise<StepNodeResult<string, TenantConfirmedIssueWasFixedResponse>> {
    this.log.resetLogs();

    const request: ReceiveMessageRequest = { fromTenantId: this.tenant.id, step: 'Tenant Confirm Issue Fixed', aimeeMessage: '', messageToAime: tenantMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<TenantConfirmedIssueWasFixedResponse>(request));
    if(result.isError) {}

    const data: DataNode<string> = { title: 'Confirm with Tenant Issue Fixed', content: tenantMessage, data: tenantMessage };

    this.log.LogInputMessage('Tenant', tenantMessage);
    this.log.LogAimeeMessage(data.title, data.content);
    this.log.LogAimeeMessage(data.title, result.data?.message!);

    this.steps.addStep<string, TenantConfirmedIssueWasFixedResponse>('Tenant', data, result.data!, this.log.getLogs());
    return this.steps.getLastStep<string, null>();
  }


  // private handleError<TInput, TOutput>(initiator: RoleType, input: DataNode<TInput>): CoordinatorStepResponse<TOutput> {
  //   const log: LogCoordinator = new LogCoordinator();
  //   this.steps.addStep<TInput, null>(initiator, input, null, log.getLogs(), StepMark.None);
  //   return { logs: log.getLogs(), response:  null, isError: true};
  // }
}

