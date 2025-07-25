import { GptMessage } from "./models/GptMessage";

export class ChatOrchestrator {
  private messages: GptMessage[] = [];

  registerMessage(message: GptMessage) {
    this.messages.push(message);
    console.log(this.messages);
  }

  get GetLastMessage(): GptMessage {
    return this.messages[this.messages.length - 1];
  }

  get IsEmpty(): boolean {
    return this.messages.length === 0;
  }
}
