export interface MessageResponse<T> {
  text: string;
  deliveryTime: string;
  time: T;
}

export interface MessageResponseBase {
  response: string;
  time: string;
}

