export interface MessageResponse<T> {
  text: string;
  deliveryTime: string;
  data: T;
}

export interface MessageResponseBase {
  response: string;
  date: string;
}

