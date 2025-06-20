export interface ProcessIssueRequest {
  User: string;
  IssueDescription: string;
}

export interface ProcessIssueResponse {
  category: string;
  issue: string;
  tenantName: string;
  phone: string;
  nextStep: string;
  response: string;
  time: string;
}

