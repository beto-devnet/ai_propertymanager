import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AssistantRequest, AssistantResponse} from '../shared/app.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketApiService {

  private baseUrl = environment.apiDemoUrl;
  // private baseUrl = 'https://localhost:7290/api/issue'
  // private baseUrl = 'https://clownfish-app-2ji3n.ondigitalocean.app/api/issue'
  private http: HttpClient = inject(HttpClient);
  constructor() { }

  public reportIssue(request: AssistantRequest) {
    const url = `${this.baseUrl}/report`;
    return this.http.post<AssistantResponse>(url, request);
  }
}
