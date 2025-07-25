
export interface IMessageItem {
  name: string;
  text: string;
}

export interface IMessage {
  title: string;
  description: string;
  date: Date;
  messageContent: IMessageItem[];
}


export type simpleMessageType = 'Sent' | 'Receive';

export interface ISimpleMessage {
  text: string;
  date: Date;
  type: simpleMessageType;
}

// export interface IMessageAgentInformation extends Omit<IMessage, 'messageContent' | 'title'> {
//   content: string;
// }

export class MessageEngine {

  private messages: IMessage[];

  constructor() {
    this.messages = [];
  }

  addMessage(message: IMessage) {
    this.messages.push(message);
  }

  addMessageFrom() {

  }

  get lastMessage(): IMessage {
    return this.messages[this.messages.length - 1];
  }

  get allMessages(): IMessage[] {
    return this.messages;
  }

  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  reset(): void {
    this.messages = [];
  }
}
