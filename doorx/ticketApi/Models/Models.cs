namespace ticketApi.Models;

public class Models
{
    public class AssistantRequest
    {
        public int UserId { get; set; }
        public string IssueDescription { get; set; } = string.Empty;
    }
    
    public class AssistantResponse
    {
        public string Answer { get; set; } = string.Empty;
    }
    
    public record LoginRequest(int Id, string Password);

    public record Tenant(int Id, string Name, string Phone, string Address);
    
    public record Tenant2(string Name, string Telephone);
    public record LeaseAgreementClause(string Category, string Clause);
    public record Property2(int Id, string Address, Tenant2 Tenant, string Landlord, List<LeaseAgreementClause> LeaseAgreementClauses);
    public record PropertyBrief(int Id, string Name);
    
    public record Contact(string Name, string Email, string Phone, string PreferredMethodOfContact);
    public record Vendor(int Id, string Category, bool PreferedVendor, string CompanyName, string DescriptionOfServices, List<Contact> Contacts);
    public record Property(string Address, string Tenant, string Landlord, string ImportantContractObligations);
    public record Category(string Name, string Description);

    
    public record TicketRequest(string Category, string Description, string VendorId);
    public class Ticket
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Category { get; set; }
        public string Description { get; set; }
        public Vendor? Vendor {
            get;
            set;
        }
    }

    public record Example(int Id, string Issue);
}

