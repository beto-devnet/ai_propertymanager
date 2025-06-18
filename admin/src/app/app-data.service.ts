import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageResponse } from './demo/models/MessageResponse';
import { MessageLog } from './demo/models/messageLog';

@Injectable({
  providedIn: 'root'
})
export class AppDataService {

  // private logEvents: MessageResponse<>
  private messagesLog: MessageLog[] = [];

  constructor() { }

  private appDataSubject = new BehaviorSubject<MessageResponse<any> | null>(null);
  appData$: Observable<MessageResponse<any> | null> = this.appDataSubject.asObservable();

  setAppData(data: MessageResponse<any>): void {
    this.appDataSubject.next(data);
  }

  getAppData(): MessageResponse<any> | null {
    return this.appDataSubject.value;
  }
}
