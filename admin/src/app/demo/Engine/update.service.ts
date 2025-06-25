import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Example } from '../models/example.model';
import { Category } from '../models/category.example';
import { ProcessIssueRequest, ProcessIssueResponse } from './models/ProcessIssue';
import { Step } from '../models/step';
import { ServiceResponse } from './models/ServiceResponse';
import { SendMessageRequest } from './models/SendMessageRequest';
import { Vendor } from '../models/vendor.model';
import { AskForAvailability, AskForAvailabilityResponse } from './models/AskForAvailability';
import { ReceiveMessageRequest } from './models/ReceiveMessageRequest';
import { VendorMessageAvailabilityResponse } from './models/VendorMessageAvailabilityResponse';
import { Tenant } from '../models/Tenant';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  private path = `${environment.apiUrl}`;
  private httpClient: HttpClient = inject(HttpClient);

  constructor() {
  }

  getRandomTenant(): Observable<Tenant> {
    const url = `${this.path}/message/randon-tenant`;
    return this.httpClient.get<Tenant>(url);
  }

  getIssues(): Observable<Example[]> {
    const url = `${this.path}/message/examples`;
    return this.httpClient.get<Example[]>(url);
  }

  getCategories(): Observable<Category[]> {
    const url = `${this.path}/category/list`;
    return this.httpClient.get<Category[]>(url);
  }

  getVendors(): Observable<Vendor[]> {
    const url = `${this.path}/vendor/list`;
    return this.httpClient.get<Vendor[]>(url);
  }

  getVendor(category: string): Observable<Vendor> {
    const url = `${this.path}/message/get-vendor/${category}`;
    return this.httpClient.get<Vendor>(url);
  }

  processIssue(request: ProcessIssueRequest): Observable<ServiceResponse<ProcessIssueResponse>> {
    const url = `${this.path}/message/process-issue`;
    return this.httpClient
      .post<ProcessIssueResponse>(url, request)
      .pipe(
        map(result => this.mapSuccess<ProcessIssueResponse>(result)),
        catchError(error => of(this.mapFailure(error, Step.LogIssue)))
      );
  }

  sendMessage(request: SendMessageRequest<AskForAvailability>): Observable<ServiceResponse<AskForAvailabilityResponse>> {
    const url = `${this.path}/message/send`;
    return this.httpClient
      .post(url, request)
      .pipe(
        map(result => this.mapSuccessMessage(result)),
        catchError(error => of(this.mapFailure(error, Step.Next)))
      )
  }

  sendMessageGeneric<TInput, TOutput>(request: SendMessageRequest<TInput>): Observable<ServiceResponse<TOutput>> {
    const url = `${this.path}/message/send`;
    return this.httpClient
      .post(url, request)
      .pipe(
        map(result => this.mapSuccessMessage(result)),
        catchError(error => of(this.mapFailure(error, Step.Next)))
      )
  }

  receiveMessage(request: ReceiveMessageRequest): Observable<ServiceResponse<VendorMessageAvailabilityResponse>> {
    const url = `${this.path}/message/receive`;
    return this.httpClient
      .post(url, request)
      .pipe(
        map(result => this.mapSuccessMessage(result)),
        catchError(error => of(this.mapFailure(error, Step.Next)))
      )
  }

  receiveMessageGeneric<T>(request: ReceiveMessageRequest): Observable<ServiceResponse<T>> {
    const url = `${this.path}/message/receive`;
    return this.httpClient
      .post(url, request)
      .pipe(
        map(result => this.mapSuccessMessage(result)),
        catchError(error => of(this.mapFailure(error, Step.Next)))
      )
  }

  private mapSuccess<T>(data: T): ServiceResponse<T> {
    return {
      data: data,
      isError: false
    };
  }

  private mapSuccessMessage(data: any): ServiceResponse<any> {
    return {
      data: data.response,
      isError: false
    };
  }

  private mapFailure(error: Error, step: Step): ServiceResponse<any> {
    return {
      error: { step: step, message: error.message },
      isError: true
    }
  }

  // getServiceAvailabilityMessage(request: ServiceAvailabilityMessageRequest): Observable<ServiceAvailabilityMessageResponse> {
  //   const url = `${this.path}/message/service-availability-message`;
  //   return this.httpClient.post<ServiceAvailabilityMessageResponse>(url, request);
  // }
  //
  // getVendorAvailabilityResponse(): Observable<VendorAvailabilityResponse> {
  //   const url = `${this.path}/message/vendor-availability-response`;
  //   return this.httpClient.get<VendorAvailabilityResponse>(url);
  // }
  //
  // updateTenantVendorContact(request: InformTenantVendorContact): Observable<InformTenantVendorContactResponse> {
  //   const url = `${this.path}/message/inform-tenant-vendor-contact`;
  //   return this.httpClient.post<InformTenantVendorContactResponse>(url, request);
  // }
  //
  // vendorIncomingMessageConfirmationVisit(): Observable<VendorMessageToAgent> {
  //   const url = `${this.path}/message/get-vendor-message`;
  //   return this.httpClient.get<VendorMessageToAgent>(url);
  // }
  //
  // aimeeMessageToTenantAboutVisitTime(request: AimeeMessageToTenantRequest): Observable<AimeeMessageToTenantResponse> {
  //   const url = `${this.path}/message/inform-tenant-visit-time`;
  //   return this.httpClient.post <AimeeMessageToTenantResponse>(url, request);
  // }
  //
  // vendorInformFixedHasCompleted(request: FixHasCompletedRequest): Observable<FixHasCompletedResponse> {
  //   const url = `${this.path}/message/fix-completed`;
  //   return this.httpClient.post <FixHasCompletedResponse>(url, request);
  // }
  //
  // IssueFixedResponse(request: ReplyToVendorIssueFixedRequest): Observable<ReplyToVendorIssueFixedResponse> {
  //   const url = `${this.path}/message/message-to-vendor-fixed-issue`;
  //   return this.httpClient.post <ReplyToVendorIssueFixedResponse>(url, request);
  // }
  //
  // MessageToCloseTicket(request: MessageToTenantCloseTicketRequest): Observable<MessageToTenantCloseTicketResponse> {
  //   const url = `${this.path}/message/message-to-tenant-close-ticket`;
  //   return this.httpClient.post <MessageToTenantCloseTicketResponse>(url, request);
  // }
  //
  // TenantResponseCloseTicket(request: TenantResponseToCloseTicketRequest): Observable<TenantResponseToCloseTicketResponse> {
  //   const url = `${this.path}/message/tenant-to-aimee-close-ticket`;
  //   return this.httpClient.post <TenantResponseToCloseTicketResponse>(url, request);
  // }
}
