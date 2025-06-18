import { DestroyRef, inject } from '@angular/core';
import { DemoService } from './demo.service';
import { Category } from './models/category.example';
import { catchError, delay, firstValueFrom, of } from 'rxjs';
import { Example } from './models/example.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IssueResponse } from './models/issueResponse';
import { EventMessageLog, MessageLog } from './models/messageLog';
import { Step } from './models/step';
import {
  InformTenantVendorContact,
  InformTenantVendorContactResponse,
  ServiceAvailabilityMessageRequest, ServiceAvailabilityMessageResponse,
  ServiceAvailabilityRequest,
  ServiceAvailabilityResponse, VendorAvailabilityResponse, VendorMessageToAgent
} from './models/tenant.models';

export class MessageComposer {

  private demoService: DemoService = inject(DemoService);
  private destroyRef$: DestroyRef = inject(DestroyRef);

  private eventLog: Array<MessageLog | IssueResponse> = [];
  private tenantLog: MessageLog[] = [];
  private vendorLog: MessageLog[] = [];
  constructor() {
  }

  async getCategories(): Promise<Category[]> {
    return await firstValueFrom(this.demoService.getCategories());
  }

  async getExampleIssues(): Promise<Example[]> {
    return await firstValueFrom(this.demoService.getIssues());
  }

  async issueRequest(issueDescription: string, user: string): Promise<IssueResponse| Error> {
    const sub = this.demoService
      .processIssue({ IssueDescription: issueDescription, User: user })
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        delay(1500),
        catchError((error: Error) => {
          throw error;
        }),
      );

    return await firstValueFrom(sub);
  }

  async serviceAvailabilityMessage(request: ServiceAvailabilityMessageRequest): Promise<ServiceAvailabilityMessageResponse | null> {
    const sub = this.demoService
      .getServiceAvailabilityMessage(request)
      .pipe(
        delay(4000),
        catchError((e: Error) => {
          return of(null);
        })
      );

    return await firstValueFrom(sub);
  }

  async getVendorAvailabilityResponse(): Promise<VendorAvailabilityResponse | null> {
    const sub = this.demoService
      .getVendorAvailabilityResponse()
      .pipe(
        delay(4000),
        catchError((e: Error) => {
          return of(null);
        })
      );

    return firstValueFrom(sub);
  }

 updateTenantTicket = async (request: InformTenantVendorContact): Promise<InformTenantVendorContactResponse | null> => {
    const sub = this.demoService
      .updateTenantVendorContact(request)
      .pipe(
        delay(4000),
        catchError((e: Error) => {
          return of(null);
        })
      );

    return await firstValueFrom(sub);
  }

  vendorIncomingMessageConfirmationVisit = async () : Promise<VendorMessageToAgent | null> => {
    const sub = this.demoService
      .vendorIncomingMessageConfirmationVisit()
      .pipe(
        delay(4000),
        catchError((e: Error) => {
          return of(null);
        })
      );

    return firstValueFrom(sub);
  }

  issueToEventMessageLog(issue: IssueResponse): EventMessageLog {
    return {
      task: 'Categorize the tenant issue',
      response: issue.response,
      deliveryTime: issue.date,
      nextStep: Step.Next,
    };
  }

  toEventMessageLog(task: string, response: string, time: string, nextStep?: Step): EventMessageLog {
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
