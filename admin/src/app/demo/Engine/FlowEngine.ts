import {
  ProcessIssueStep,
  SendMessageStep, TenantConfirmedIssueWasFixed,
  TenantSendMessageStep, VendorConfirmedIssueWasFixed, VendorScheduledTimeForVisitWithTenant,
  VendorSendMessageStep
} from './Step/ProcessIssueStep';
import { FlowEngineResponse } from "./FlowEngineResponse";
import { ProcessIssueRequest, ProcessIssueResponse } from './models/ProcessIssue';
import { UpdateService } from './update.service';
import { SendMessageRequest } from './models/SendMessageRequest';
import { AskForAvailability, AskForAvailabilityResponse } from './models/AskForAvailability';
import { ReceiveMessageRequest } from './models/ReceiveMessageRequest';
import { VendorMessageAvailabilityResponse } from './models/VendorMessageAvailabilityResponse';
import {
  InformTenantContactFromVendor,
  InformTenantContactFromVendorResponse
} from './models/InformTenantContactFromVendor';
import { VendorScheduledVisitTimeResponse } from './models/VendorScheduledVisitTime';
import { VendorConfirmedIssueWasFixedResponse } from './models/VendorConfirmedIssueWasFixedResponse';
import { TenantConfirmedIssueWasFixedResponse } from './models/TenantConfirmedIssueWasFixedResponse';

export class FlowEngine {
  private processIssueStep: ProcessIssueStep;
  private sendMessageStep: SendMessageStep;
  private vendorMessageStep: VendorSendMessageStep;
  private informTenantVendorReachOut: TenantSendMessageStep;
  private vendorScheduledVisit: VendorScheduledTimeForVisitWithTenant;
  private vendorConfirmFixedIssue: VendorConfirmedIssueWasFixed;
  private tenantConfirmFixedIssue: TenantConfirmedIssueWasFixed;

  constructor(service: UpdateService) {
    this.processIssueStep = new ProcessIssueStep(service);
    this.sendMessageStep = new SendMessageStep(service);
    this.vendorMessageStep = new VendorSendMessageStep(service);
    this.informTenantVendorReachOut = new TenantSendMessageStep(service);
    this.vendorScheduledVisit = new VendorScheduledTimeForVisitWithTenant(service);
    this.vendorConfirmFixedIssue = new VendorConfirmedIssueWasFixed(service);
    this.tenantConfirmFixedIssue = new TenantConfirmedIssueWasFixed(service);
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

  async vendorMessageConfirmAvailability(req: ReceiveMessageRequest): Promise<FlowEngineResponse<VendorMessageAvailabilityResponse>> {
    let flowResponse: FlowEngineResponse<VendorMessageAvailabilityResponse> = { isError: false };

    const stepResult = await this.vendorMessageStep.run(req);
    if(stepResult.err) {
      flowResponse.isError = true;
      flowResponse.error = stepResult.val;
      return flowResponse;
    }

    flowResponse.isError = false;
    flowResponse.data = stepResult.val;
    return flowResponse;
  }

  async InformTenantThatVendorReachOut(req: SendMessageRequest<InformTenantContactFromVendor>): Promise<FlowEngineResponse<InformTenantContactFromVendorResponse>> {
    let flowResponse: FlowEngineResponse<InformTenantContactFromVendorResponse> = { isError: false };

    const stepResult = await this.informTenantVendorReachOut.run(req);
    if(stepResult.err) {
      flowResponse.isError = true;
      flowResponse.error = stepResult.val;
      return flowResponse;
    }

    flowResponse.isError = false;
    flowResponse.data = stepResult.val;
    return flowResponse;
  }

  async getDateAndTimeForVisit(req: ReceiveMessageRequest): Promise<FlowEngineResponse<VendorScheduledVisitTimeResponse>> {
    let flowResponse: FlowEngineResponse<VendorScheduledVisitTimeResponse> = { isError: false };

    const stepResult = await this.vendorScheduledVisit.run(req);
    if(stepResult.err) {
      flowResponse.isError = true;
      flowResponse.error = stepResult.val;
      return flowResponse;
    }

    flowResponse.isError = false;
    flowResponse.data = stepResult.val;
    return flowResponse;
  }

  async confirmVendorIssueWasFixed(req: ReceiveMessageRequest): Promise<FlowEngineResponse<VendorConfirmedIssueWasFixedResponse>> {
    let flowResponse: FlowEngineResponse<VendorConfirmedIssueWasFixedResponse> = { isError: false };

    const stepResult = await this.vendorConfirmFixedIssue.run(req);
    if(stepResult.err) {
      flowResponse.isError = true;
      flowResponse.error = stepResult.val;
      return flowResponse;
    }

    flowResponse.isError = false;
    flowResponse.data = stepResult.val;
    return flowResponse;
  }

  async confirmTenantIssueWasFixed(req: ReceiveMessageRequest): Promise<FlowEngineResponse<TenantConfirmedIssueWasFixedResponse>> {
    let flowResponse: FlowEngineResponse<TenantConfirmedIssueWasFixedResponse> = { isError: false };

    const stepResult = await this.tenantConfirmFixedIssue.run(req);
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
