﻿import { StepBuilder, StepList, StepMark, StepNodeResponse, StepNodeType } from './Step';
import { ProcessIssueRequest, ProcessIssueResponse } from '../Engine/models/ProcessIssue';
import { Tenant } from '../models/Tenant';
import { inject } from '@angular/core';
import { UpdateService } from '../Engine/update.service';
import { firstValueFrom } from 'rxjs';
import { Vendor } from '../models/vendor.model';
import { AskForAvailability, AskForAvailabilityResponse } from '../Engine/models/AskForAvailability';
import { SendMessageRequest } from '../Engine/models/SendMessageRequest';
import { ReceiveMessageRequest } from '../Engine/models/ReceiveMessageRequest';
import {
  InformTenantContactFromVendor,
  InformTenantContactFromVendorResponse
} from '../Engine/models/InformTenantContactFromVendor';
import { VendorScheduledVisitTimeResponse } from '../Engine/models/VendorScheduledVisitTime';
import { VendorConfirmedIssueWasFixedResponse } from '../Engine/models/VendorConfirmedIssueWasFixedResponse';
import { TenantConfirmedIssueWasFixedResponse } from '../Engine/models/TenantConfirmedIssueWasFixedResponse';
import { VendorAvailabilityResponse } from '../models/vendorAvailabilityResponse';
import { format } from 'date-fns';
import { Property2 } from '../../login/models';

export class Coordinator {
  private regularStep: StepList;
  // private tenant!: Tenant;
  private property!: Property2;
  private service: UpdateService = inject(UpdateService);

  constructor() {
    this.regularStep = new StepList();
  }

  set Tenant(tenant: Tenant) {
    // this.tenant = tenant;
  }

  set Property(property: Property2) {
    this.property = property;
  }

  get LastMark(): StepMark {
    return this.regularStep.getLastMark();
  }

  async createIssue(issue: ProcessIssueRequest): Promise<StepNodeResponse<ProcessIssueRequest,ProcessIssueResponse>> {
    const result = await firstValueFrom(this.service.processIssue(issue));

    if(result.isError) {}

    const issueResponse: ProcessIssueResponse = result.data!;

    const builder = new StepBuilder<ProcessIssueRequest, ProcessIssueResponse>();
    const step = builder
      .WithTitle('Tenant Request')
      .WithInputData(issue)
      .WithOutputData(issueResponse)
      .OfType(StepNodeType.Issue)
      .build();

    step.sendMessageToTenant(issueResponse.response);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep()
  }

  async selectVendorBasedOnCategory(categoryName: string): Promise<StepNodeResponse<string, Vendor>> {
    const vendor = await firstValueFrom(this.service.getVendor(categoryName));

    const builder = new StepBuilder<string, Vendor>();
    const step = builder
      .WithTitle('Vendor Selection')
      .WithMessage('The Vendor selected is ' + vendor.contacts[0].name + ' from ' + vendor.companyName)
      .WithInputData(categoryName)
      .WithOutputData(vendor)
      .OfType(StepNodeType.Information)
      .build();

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep()
  }

  async AskForAvailability(categoryName: string, vendorId: number, issue: string): Promise<StepNodeResponse<AskForAvailability, AskForAvailabilityResponse>> {
    const request: AskForAvailability = {
      UserId: this.property.id,
      Category:  categoryName,
      VendorId: vendorId,
      Issue: issue,
    };
    const messageReq: SendMessageRequest<AskForAvailability> = { toVendorId: this.property.id, request: request, step: 'ask for availability' };

    const result = await firstValueFrom(this.service.sendMessage(messageReq))
    const data = result.data!;

    const builder = new StepBuilder<AskForAvailability, AskForAvailabilityResponse>();
    const step = builder
      .WithTitle('Ask Vendor for Availability')
      .WithMessage(data.message)
      .WithInputData(request)
      .WithOutputData(data)
      .OfType(StepNodeType.Information)
      .build();

    step.sendMessageToVendor(data.message);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }


  waitForVendorAvailabilityReply(): StepNodeResponse<null, null> {
    const builder = new StepBuilder<null, null>();
    const step = builder
      .WithTitle('Waiting for Vendor Reply')
      .WithMessage('Waiting for vendor to reply with availability')
      .OfType(StepNodeType.Waiting, StepMark.WaitingVendorAvailabilityReply)
      .build();

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  waitForVendorConfirmVisit(): StepNodeResponse<string, null> {
    const builder = new StepBuilder<string, null>();
    const step = builder
      .WithTitle('Waiting for Vendor Confirm Visit')
      .OfType(StepNodeType.Waiting, StepMark.WaitingVendorScheduleVisit)
      .build();

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  async vendorReplyAvailability(vendorId: number, vendorReplyMessage: string): Promise<StepNodeResponse<string, VendorAvailabilityResponse>> {
    const receiveMessage: ReceiveMessageRequest = { fromVendorId: vendorId, messageToAime:  vendorReplyMessage, step: 'availability response', aimeeMessage: '' };
    const result = await firstValueFrom(this.service.receiveMessage(receiveMessage));
    if(result.isError) {}
    const data = result.data!;

    const builder = new StepBuilder<string, VendorAvailabilityResponse>();
    const step = builder
      .WithTitle('Vendor Availability Reply ')
      .WithMessage(data.message)
      .WithInputData(vendorReplyMessage)
      .WithOutputData(data)
      .OfType(StepNodeType.Node)
      .build();

    step.receiveMessageFromVendor(vendorReplyMessage);
    step.addLogStep('Vendor', vendorReplyMessage);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  async InformTenantAboutContactWithVendor(vendorId: number): Promise<StepNodeResponse<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>> {

    const request: InformTenantContactFromVendor = { vendorId: vendorId, tenantId: this.property.id };
    const messageRequest: SendMessageRequest<InformTenantContactFromVendor> = { toTenantId: this.property.id, step: 'Response to Tenant', request };
    const result = await firstValueFrom(this.service.sendMessageGeneric<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>(messageRequest));

    if(result.isError) {}
    const data = result.data!;
    const builder = new StepBuilder<InformTenantContactFromVendor, InformTenantContactFromVendorResponse>();
    const step = builder
      .WithTitle('Inform Tenant Contact From Vendor')
      .WithMessage(data.message!)
      .WithInputData(request)
      .WithOutputData(data)
      .OfType(StepNodeType.Information)
      .build();

    step.sendMessageToTenant(data.message);
    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  async vendorConfirmScheduledVisit(vendorId: number, vendorName: string, vendorCompany: string, vendorMessage: string): Promise<StepNodeResponse<string, VendorScheduledVisitTimeResponse>> {
    const request: ReceiveMessageRequest = { fromVendorId: vendorId, step: 'Vendor Confirm Visit to Tenant', aimeeMessage: '', messageToAime: vendorMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<VendorScheduledVisitTimeResponse>(request));
    if(result.isError) {}

    const data = result.data!;
    const confirmationMessage = ``;
    const builder = new StepBuilder<string, VendorScheduledVisitTimeResponse>();
    const step = builder
      .WithTitle('Vendor Confirm Visit')
      .WithMessage('Vendor confirm a date and time visit with tenant')
      .WithInputData(vendorMessage)
      .WithOutputData(data)
      .OfType(StepNodeType.Node)
      .build();

    step.receiveMessageFromVendor(vendorMessage);
    step.addLogStep('Vendor', vendorMessage);

    const date = Date.parse(`${result.data?.scheduleDate!} ${result.data?.scheduleTime!}`);
    const dateFormatted = format(new Date(date), "eeee, dd 'at' HH:mm" );
    const messageToTenant = `Hi ${this.property.tenant.name}. Quick update.
    ${vendorName} from ${vendorCompany} has confirmed a date and time to visit your home by ${dateFormatted}.`

    step.sendMessageToTenant(messageToTenant);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  waitForVendorConfirmIssueFix(): StepNodeResponse<string, null> {
    const builder = new StepBuilder<string, VendorScheduledVisitTimeResponse>();
    const step = builder
      .WithTitle('Waiting for Vendor To confirm Issue Fixed')
      .OfType(StepNodeType.Waiting, StepMark.WaitingVendorConfirmIssueFixed)
      .build();

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  async vendorConfirmIssueFixed(vendorId: number, vendorMessage: string): Promise<StepNodeResponse<string, VendorConfirmedIssueWasFixedResponse>> {
    const request: ReceiveMessageRequest = { fromVendorId: vendorId, step: 'Vendor Confirm Issue was fixed', aimeeMessage: '', messageToAime: vendorMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<VendorConfirmedIssueWasFixedResponse>(request));
    if(result.isError) {}

    const data = result.data!;
    const builder = new StepBuilder<string, VendorConfirmedIssueWasFixedResponse>();
    const step = builder
      .WithTitle(request.step)
      .WithMessage(data.message)
      .WithInputData(vendorMessage)
      .WithOutputData(data)
      .OfType(StepNodeType.Node)
      .build();

    step.receiveMessageFromVendor(vendorMessage);
    step.sendMessageToVendor(data.message);
    step.addLogStep('Vendor', vendorMessage);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  waitForTenantConfirmIssueFix(vendorName: string, vendorCompany: string): StepNodeResponse<string, null> {
    const builder = new StepBuilder<string, null>();
    const step = builder
      .WithTitle('Waiting for Tenant To confirm Issue Fixed')
      .OfType(StepNodeType.Waiting, StepMark.WaitingTenantConfirmIssueFixed)
      .build();

    const msg = `Hi, ${this.property.tenant.name}. Looks like ${vendorName} from ${vendorCompany} has fixed the issue. Can you confirm that we can close the ticket?`;
    step.sendMessageToTenant(msg);
    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  async confirmWithTenantIssueFixed(tenantMessage: string): Promise<StepNodeResponse<string, TenantConfirmedIssueWasFixedResponse>> {
    const request: ReceiveMessageRequest = { fromTenantId: this.property.id, step: 'Tenant confirmed Issue was fixed', aimeeMessage: '', messageToAime: tenantMessage };
    const result = await firstValueFrom(this.service.receiveMessageGeneric<TenantConfirmedIssueWasFixedResponse>(request));
    if(result.isError) {}

    const data = result.data!;
    const builder = new StepBuilder<string, TenantConfirmedIssueWasFixedResponse>();
    const step = builder
      .WithTitle('Tenant Confirm Issue Fixed')
      .WithMessage(data.message)
      .WithInputData(tenantMessage)
      .WithOutputData(data)
      .OfType(StepNodeType.Node)
      .build();

    step.receiveMessageFromTenant(tenantMessage);
    step.sendMessageToTenant(data.message);
    step.addLogStep('Tenant', tenantMessage);

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }

  closeIssue(): StepNodeResponse<string, string> {
    const builder = new StepBuilder<string, string>();
    const step = builder
      .WithTitle('Ticket Completed')
      .WithInputData('')
      .WithOutputData('')
      .OfType(StepNodeType.Information)
      .build();

    this.regularStep.addStep(step);
    return this.regularStep.getLastStep();
  }
}

