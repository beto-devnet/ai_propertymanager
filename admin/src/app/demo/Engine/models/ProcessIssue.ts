export interface ProcessIssueRequest {
  UserId: number;
  IssueDescription: string;
}

export interface ProcessIssueResponse {
  category: string;
  issue: string;
  tenantName: string;
  phone: string;
  address: string;
  step: string;
  response: string;
  resolutionResponsibility: string;
}

