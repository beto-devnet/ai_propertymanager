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
        public record TenantScheduledVisitResponse(DateOnly ScheduleDate, TimeOnly ScheduleTime, string Time);
        public record VendorFixedIssueResponse(bool IssueFixed, string Message, string Time): MessageBase(Message, Time);
    }
    
    
    public class Message
    {
        public record SendMessageRequest(int ToVendorId , int ToTenantId , string Step, object Request);

        public record SendMessageResponse(object Response);
        public record ReceiveMessageRequest(int FromVendorId , int FromTenantId , string Step, string AimeeMessage, string MessageToAime);
        public record ReceiveMessageResponse(object Response);
    }
    
    public record ServiceAvailabilityRequest(string User, string Phone, string Category, string Issue);
    public record ServiceAvailabilityResponse(string Message, string Time, int VendorId);
    public record VendorAvailabilityResponse(string Message, string Time, bool IsAvailable);

    public record InformTenantVendorContact(string User, string Tenant, int VendorId);
    public record InformTenantVendorContactResponse(string Message, string Time);

    public record VendorMessageToAgent(string Message, string Time);
    
    public record AimeeMessageToTenantRequest(string User, int VendorId, string ScheduleTime);
    public record AimeeMessageToTenantResponse(string Message, string Time);
    
    public record FixHasCompletedRequest(int VendorId, string Message);
    public record FixHasCompletedResponse(string Message, string Time);


    public record ReplyToVendorIssueFixedRequest(int VendorId);

    public record ReplyToVendorIssueFixedResponse(string Message, string Time);
    
    public record MessageToTenantCloseTicketRequest(int VendorId, string User);

    public record MessageToTenantCloseTicketResponse(string Message, string Time);
    
    public record TenantResponseToCloseTicketRequest(string User, bool CanClose, string Message);
    public record TenantResponseToCloseTicketResponse(string Message, string Time);
}