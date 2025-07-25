export interface ChatGptResponse {
  ticketId: string;
  propertyId: string;
  category: string;
  // likelyCause: string;
  recommendedSolution: string;
  nextStep: NextStep;
}

export interface NextStep {
  insufficientInformation: boolean;
  instruction: nextStepInstruction;
  actor: string;
  responseToActor: string;
  context: string;
}

export type nextStepInstruction = 'replyToTicket' | 'SendSMS' | 'Wait' | 'replyToTenant' | 'replyToVendor' | 'CloseTicket' | 'other';
