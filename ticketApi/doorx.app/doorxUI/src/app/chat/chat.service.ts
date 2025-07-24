import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Example } from './models/Example';
import { Category } from './models/Category';
import { Vendor } from './models/Vendor';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private path = `${environment.apiUrl}`;
  private httpClient: HttpClient = inject(HttpClient);

  constructor() { }

  getPrompt(propertyId: number): Observable<string> {
    const url = `${this.path}/message/prompt/${propertyId}`;
    return this.httpClient.request('get', url, { responseType: 'text' });
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
}
