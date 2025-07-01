namespace ticketApi.Models;

public class Demo
{

    public record MessageBase(string Message, string Time);
    public class Models
    {
        public record AskForAvailability(int UserId, int VendorId, string Issue, string Category);
        public record AskForAvailabilityResponse(string Message, string Time): MessageBase(Message, Time);

        public record VendorMessageAvailabilityResponse(bool IsAvailable, string Message, string Time): MessageBase(Message, Time);
        
        public record InformTenantContactFromVendor( int VendorId, int TenantId);
        public record InformTenantContactFromVendorResponse(string Message, string Time): MessageBase(Message, Time);

        public record TenantScheduledVisit(string message);
        public record TenantScheduledVisitResponse(bool IsScheduled, DateOnly ScheduleDate, TimeOnly ScheduleTime, string Time);
        public record VendorFixedIssueResponse(bool IssueFixed, string Message, string Time): MessageBase(Message, Time);
        public record TenantConfirmedFixedIssue(bool IssueFixed, string Message, string Time): MessageBase(Message, Time);
    }
    
    
    public class Message
    {
        public record SendMessageRequest(int ToVendorId , int ToTenantId , string Step, object Request);

        public record SendMessageResponse(object Response);
        public record ReceiveMessageRequest(int FromVendorId , int FromTenantId , string Step, string AimeeMessage, string MessageToAime);
        public record ReceiveMessageResponse(object Response);
    }
}