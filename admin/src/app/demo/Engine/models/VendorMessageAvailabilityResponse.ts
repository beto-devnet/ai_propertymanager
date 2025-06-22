import { BaseMessage } from './baseMessage';

export interface VendorMessageAvailabilityResponse extends BaseMessage {
  isAvailable: boolean;
}
