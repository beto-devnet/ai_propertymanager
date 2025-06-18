namespace ticketApi.Models;

public class Demo
{
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