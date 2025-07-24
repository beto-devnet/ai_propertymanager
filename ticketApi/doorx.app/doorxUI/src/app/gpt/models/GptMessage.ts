import { ChatGptResponse } from './ChatGptResponse';

export interface GptMessage {
  text: string;
  response: ChatGptResponse;
}
