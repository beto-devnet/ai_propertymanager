export interface ServiceAvailabilityMessageRequest {
  user: string;
  phone: string;
  category: string;
  issue: string;
}

export interface ServiceAvailabilityMessageResponse {
  message: string;
  time: string;
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
}
export interface InformTenantVendorContactResponse {
  message: string,
  time: string
}

export interface VendorMessageToAgent {
  message: string,
  time: string;
}


