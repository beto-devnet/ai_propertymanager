import { BaseMessage } from './baseMessage';

export interface AskForAvailability {
  UserId: number;
  VendorId: number;
  Issue: string;
  Category: string;
}

export interface AskForAvailabilityResponse extends BaseMessage{
}


