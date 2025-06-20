export interface SendMessageRequest<T> {
  toVendorId?: number;
  toTenantId?: number;
  step: string;
  request: T
}


