namespace ticketApi.Models;

public class Demo
{
    public record ServiceAvailabilityRequest(string User, string Phone, string Category, string Issue);
    public record ServiceAvailabilityResponse(string Message, string Time);
    public record VendorAvailabilityResponse(string Message, string Time, bool IsAvailable);

    public record InformTenantVendorContact(string User, string Tenant);
    public record InformTenantVendorContactResponse(string Message, string Time);

    public record VendorMessageToAgent(string Message, string Time);
}