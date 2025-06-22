export interface ReceiveMessageRequest {
  fromVendorId?: number;
  fromTenantId?: number;
  step: string;
  aimeeMessage: string;
  messageToAime: string;
}
