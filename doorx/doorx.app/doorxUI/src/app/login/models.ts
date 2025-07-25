export interface Tenant2 {
    name: string;
    telephone: string;
}

export interface LeaseAgreementClause {
    category: string;
    clause: string;
}

export interface Property2 {
    id: number;
    address: string;
    tenant: Tenant2;
    landlord: string;
    leaseAgreementClauses: LeaseAgreementClause[];
}

export interface TenantLogin {
  id: number;
  name: string
}

export interface LoginRequest {
  id: number;
  password: string;
}
