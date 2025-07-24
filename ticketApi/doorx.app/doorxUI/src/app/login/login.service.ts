import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, Property2, PropertyBrief } from './models';

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

  allPropertiesBrief(): Observable<PropertyBrief[]> {
    return this.httpClient.get<PropertyBrief[]>(`${environment.apiUrl}/message/all-properties-brief`);
  }

  allProperties(): Observable<Property2[]> {
    return this.httpClient.get<Property2[]>(`${environment.apiUrl}/message/all-properties`);
  }
}
