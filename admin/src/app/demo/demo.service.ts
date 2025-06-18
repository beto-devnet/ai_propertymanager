import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Example } from './models/example.model';
import { Category } from './models/category.example';
import { IssueRequest } from './models/issueRequest';
import { IssueResponse } from './models/issueResponse';
import {
  AimeeMessageToTenantRequest,
  AimeeMessageToTenantResponse,
  FixHasCompletedRequest,
  FixHasCompletedResponse,
  InformTenantVendorContact,
  InformTenantVendorContactResponse,
  MessageToTenantCloseTicketRequest, MessageToTenantCloseTicketResponse,
  ReplyToVendorIssueFixedRequest,
  ReplyToVendorIssueFixedResponse,
  ServiceAvailabilityMessageRequest,
  ServiceAvailabilityMessageResponse, TenantResponseToCloseTicketRequest, TenantResponseToCloseTicketResponse,
  VendorAvailabilityResponse,
  VendorMessageToAgent
} from './models/tenant.models';

@Injectable({
  providedIn: 'root'
})
export class DemoService {

  private path = `${environment.apiUrl}`
  private httpClient: HttpClient = inject(HttpClient);
  constructor() { }

  getIssues(): Observable<Example[]> {
    const url = `${this.path}/message/examples`;
    return this.httpClient.get<Example[]>(url);
  }

  getCategories() : Observable<Category[]> {
    const url = `${this.path}/category/list`;
    return this.httpClient.get<Category[]>(url)
  }

  processIssue(request: IssueRequest): Observable<IssueResponse> {
    const url = `${this.path}/message/process-issue`;
    return this.httpClient.post<IssueResponse>(url, request);
  }

  getServiceAvailabilityMessage(request: ServiceAvailabilityMessageRequest): Observable<ServiceAvailabilityMessageResponse> {
    const url = `${this.path}/message/service-availability-message`;
    return this.httpClient.post<ServiceAvailabilityMessageResponse>(url, request);
  }

  getVendorAvailabilityResponse(): Observable<VendorAvailabilityResponse> {
    const url = `${this.path}/message/vendor-availability-response`;
    return this.httpClient.get<VendorAvailabilityResponse>(url);
  }

  updateTenantVendorContact(request: InformTenantVendorContact): Observable<InformTenantVendorContactResponse> {
    const url = `${this.path}/message/inform-tenant-vendor-contact`;
    return this.httpClient.post<InformTenantVendorContactResponse>(url, request);
  }

  vendorIncomingMessageConfirmationVisit(): Observable<VendorMessageToAgent> {
    const url = `${this.path}/message/get-vendor-message`;
    return this.httpClient.get<VendorMessageToAgent>(url);
  }

  aimeeMessageToTenantAboutVisitTime(request: AimeeMessageToTenantRequest): Observable<AimeeMessageToTenantResponse> {
    const url = `${this.path}/message/inform-tenant-visit-time`;
    return this.httpClient.post <AimeeMessageToTenantResponse>(url, request);
  }

  vendorInformFixedHasCompleted(request: FixHasCompletedRequest): Observable<FixHasCompletedResponse> {
    const url = `${this.path}/message/fix-completed`;
    return this.httpClient.post <FixHasCompletedResponse>(url, request);
  }

  IssueFixedResponse(request: ReplyToVendorIssueFixedRequest): Observable<ReplyToVendorIssueFixedResponse> {
    const url = `${this.path}/message/message-to-vendor-fixed-issue`;
    return this.httpClient.post <ReplyToVendorIssueFixedResponse>(url, request);
  }

  MessageToCloseTicket(request: MessageToTenantCloseTicketRequest): Observable<MessageToTenantCloseTicketResponse> {
    const url = `${this.path}/message/message-to-tenant-close-ticket`;
    return this.httpClient.post <MessageToTenantCloseTicketResponse>(url, request);
  }

  TenantResponseCloseTicket(request: TenantResponseToCloseTicketRequest): Observable<TenantResponseToCloseTicketResponse> {
    const url = `${this.path}/message/tenant-to-aimee-close-ticket`;
    return this.httpClient.post <TenantResponseToCloseTicketResponse>(url, request);
  }
}
