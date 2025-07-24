import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, Property2, TenantLogin } from './models';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private path = `${environment.apiUrl}`;
  private httpClient: HttpClient = inject(HttpClient);

  constructor() { }

  login(request: LoginRequest): Observable<Property2> {
    return this.httpClient.post<Property2>(`${environment.apiUrl}/message/login`, request);
  }

  getAllTenants(): Observable<TenantLogin[]> {
    return this.httpClient.get<TenantLogin[]>(`${environment.apiUrl}/management/tenants`);
  }

  allProperties(): Observable<Property2[]> {
    return this.httpClient.get<Property2[]>(`${environment.apiUrl}/message/all-properties`);
  }
}
