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
  nextStep: string;
  response: string;
  time: string;
}

