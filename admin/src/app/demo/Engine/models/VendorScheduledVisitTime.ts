export interface VendorScheduledVisitTime {
  message: string;
}

export interface VendorScheduledVisitTimeResponse {
  isScheduled: boolean;
  scheduleDate: string;
  scheduleTime: string;
  time: string;
}

