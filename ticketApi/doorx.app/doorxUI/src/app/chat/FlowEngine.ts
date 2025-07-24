import { ChatResponse } from "./models/response";
import { Message } from './models/Message';
import { IssueResponse } from './models/IssueResponse';

export class FlowEngine {

  private chat: Array<ChatResponse | Message | IssueResponse> = [];
  constructor() {
  }

  registerResponse(response: ChatResponse) {
    this.chat.push(response);
  }

  registerMessageFromTenant(message: string) {
    const request: Message = { from: 'Tenant', message: message };
    this.chat.push(request);
  }

  registerMessageFromVendor(message: string) {
    const request: Message = { from: 'Vendor', message: message };
    this.chat.push(request);
  }

  registerMessageFromAimee(message: string) {
    const request: Message = { from: 'Aimee', message: message };
    this.chat.push(request);
  }

  registerIssue(issue: IssueResponse): void {
    this.chat.push(issue);
  }

  get LastRegister(): ChatResponse | Message | IssueResponse {
    return this.chat[this.chat.length - 1];
  }

  get IsEmpty(): boolean {
    return this.chat.length == 0;
  }

  reset(): void {
    this.chat = [];
  }
}
