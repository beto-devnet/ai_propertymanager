import { BaseMessage } from './baseMessage';

export interface InformTenantContactFromVendor {
  vendorId: number,
  tenantId: number
}

export interface InformTenantContactFromVendorResponse extends BaseMessage {
}


