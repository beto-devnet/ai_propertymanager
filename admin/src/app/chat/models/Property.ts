export interface Tenant {
  name: string;
  telephone: string;
}

export interface LeaseAgreementClause {
  category: string;
  clause: string;
}

export interface Property {
  id: number;
  address: string;
  tenant: Tenant;
  landlord: string;
  leaseAgreementClauses: LeaseAgreementClause[];
}
