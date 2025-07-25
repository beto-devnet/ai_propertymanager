import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThreadResponse } from './models/ThreadResponse';
import { ChatGptResponse } from './models/ChatGptResponse';
import { Request as IssueRequest } from './models/Issue';
import { MessageRequest } from './models/MessageRequest';
import { Category } from './models/Category'
import { Vendor } from './models/Vendor'
import { Example } from './models/Example'
import { Property } from '../chat/models/Property';

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {

  private path = `${environment.apiUrl}`;
  private httpClient: HttpClient = inject(HttpClient);

  constructor() {  }

  getIssues(): Observable<Example[]> {
    const url = `${this.path}/management/issues-examples`;
    return this.httpClient.get<Example[]>(url);
  }

  // getCategories(): Observable<Category[]> {
  //   const url = `${this.path}/category/list`;
  //   return this.httpClient.get<Category[]>(url);
  // }

  getVendors(): Observable<Vendor[]> {
    const url = `${this.path}/management/vendor-list`;
    return this.httpClient.get<Vendor[]>(url);
  }

  allProperties(): Observable<Property[]> {
    return this.httpClient.get<Property[]>(`${environment.apiUrl}/management/properties`);
  }

  startThread(): Observable<ThreadResponse> {
    const url = `${this.path}/openai/start-thread`;
    return this.httpClient.get<ThreadResponse>(url);
  }


  processTenantIssue(request: IssueRequest): Observable<ChatGptResponse> {
    const url = `${this.path}/openai/issue`;
    return this.httpClient.post<ChatGptResponse>(url, request);
  }

  processVendorMessage(request: MessageRequest): Observable<ChatGptResponse> {
    const url = `${this.path}/openai/processVendorMessage`;
    return this.httpClient.post<ChatGptResponse>(url, request);
  }

  processTenantMessage(request: MessageRequest): Observable<ChatGptResponse> {
    const url = `${this.path}/openai/processTenantMessage`;
    return this.httpClient.post<ChatGptResponse>(url, request);
  }

  // processAimeeMessage(request: MessageRequest): Observable<ChatGptResponse> {
  //   const url = `${this.path}/chat/processAimeeMessage`;
  //   return this.httpClient.post<ChatGptResponse>(url, request);
  // }
  //
  // processVendorMessageFake(request: MessageRequest, tipo: string): Observable<ChatGptResponse> {
  //   const url = `${this.path}/chat/processVendorMessage-fake/${tipo}`;
  //   return this.httpClient.post<ChatGptResponse>(url, request);
  // }
  //
  // processTenantMessageFake(request: MessageRequest): Observable<ChatGptResponse> {
  //   const url = `${this.path}/chat/processTenantMessage`;
  //   return this.httpClient.post<ChatGptResponse>(url, request);
  // }
  //
  // processTenantIssueFake(request: IssueRequest): Observable<ChatGptResponse> {
  //   const url = `${this.path}/chat/issue-fake`;
  //   return this.httpClient.post<ChatGptResponse>(url, request);
  // }

}
