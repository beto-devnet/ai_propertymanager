export interface ServiceAvailabilityMessageRequest {
  user: string;
  phone: string;
  category: string;
  issue: string;
}

export interface ServiceAvailabilityMessageResponse {
  message: string;
  time: string;
  vendorId: number;
}


export interface ServiceAvailabilityRequest {
  user: string;
  phone: string,
  issue: string
}

export interface ServiceAvailabilityResponse {
  isAvailable: boolean;
  issue: string
}

export interface VendorAvailabilityResponse {
  message: string,
  time: string,
  isAvailable: boolean;
}

export interface InformTenantVendorContact {
  user: string,
  tenant: string
  vendorId: number;
}
export interface InformTenantVendorContactResponse {
  message: string,
  time: string
}

export interface VendorMessageToAgent {
  message: string,
  time: string;
}

export interface AimeeMessageToTenantRequest {
  user: string,
  vendorId: number,
  scheduleTime: string,
}

export interface AimeeMessageToTenantResponse {
  message: string,
  time: string
}

export interface FixHasCompletedRequest {
  vendorId: number,
  message: string
}
export interface FixHasCompletedResponse {
  message: string,
  time: string
}

export interface ReplyToVendorIssueFixedRequest {
  vendorId: number
}

export interface ReplyToVendorIssueFixedResponse {
  message: string,
  time: string
}

export interface MessageToTenantCloseTicketRequest {
  vendorId: number,
  user: string
}

export interface MessageToTenantCloseTicketResponse {
  message: string,
  time: string
}

export interface TenantResponseToCloseTicketRequest {
  user: string,
  canClose: boolean,
  message: string
}

export interface TenantResponseToCloseTicketResponse {
  message: string,
  time: string
}
