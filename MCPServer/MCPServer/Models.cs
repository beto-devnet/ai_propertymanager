namespace MCPServer;

public class Models
{
    public class AssistantRequest
    {
        public string User { get; set; } = string.Empty;
        public string IssueDescription { get; set; } = string.Empty;
    }

    public class AssistantResponse
    {
        public string Answer { get; set; } = string.Empty;
    }

    public record Vendor(string Id, string Category, string Name, string DescriptionOfServices);
    public record Property(string Address, string Tenant, string Landlord, string ImportantContractObligations);
    public record Category(string Name, string Description);

    public record StandardResponse<T>(T Response, bool IsSuccess = true);
    public record Ticket(string Category, string Description, string VendorId);

}