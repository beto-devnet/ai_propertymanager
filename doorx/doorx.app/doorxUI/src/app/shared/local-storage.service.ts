import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AssistantResponse } from './app.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setItem(key: string, value: any): Observable<any> {
    try {
      const jsonValue = JSON.stringify(value);
      console.log('jsonValue saved', jsonValue);
      localStorage.setItem(key, jsonValue);
      return of({});
    } catch (error) {
      console.error('Error saving to local storage', error);
      return of({});
    }
  }


  getItem(key: string): Observable<AssistantResponse | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? of(JSON.parse(value)) : of(null);
    } catch (error) {
      console.error('Error reading from local storage', error);
      return of(null);
    }
  }
  // Remove item from local storage

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all local storage
  clear(): void {
    localStorage.clear();
  }
}
