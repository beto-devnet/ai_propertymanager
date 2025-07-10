import { ChatResponse } from './models/response';
import { GenerateContentResponse } from '@google/genai';

export function Composable() {
  const convertToChatResponse = (response: GenerateContentResponse): ChatResponse | null => {
    if(response.text) {
      return JSON.parse(response.text) as ChatResponse;
    }
    else {
      return null
    }
  }

  return {
    convertToChatResponse
  }
}
