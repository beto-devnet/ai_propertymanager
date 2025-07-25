export type Role = 'Tenant' | 'Vendor' | 'Aimee';

export interface Message {
  from: Role;
  message: string;
}

export interface BubbleMessage {
  isFromAimee: boolean;
  message: string;
}
