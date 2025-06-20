namespace ticketApi.Services;


public class TenantService
{
    private List<Models.Models.Tenant> GenerateTenants()
    {
        return new List<Models.Models.Tenant>
        {
            new (Id: 1, "John Smith", "555-0101", "123 Main St"),
            new (Id: 2, "Emma Johnson", "555-0102", "456 Oak Ave"),
            new (Id: 3, "Michael Brown", "555-0103", "789 Pine Rd"),
            new (Id: 4, "Sarah Davis", "555-0104", "321 Elm St"),
            new (Id: 5, "James Wilson", "555-0105", "654 Maple Dr"),
            new (Id: 6, "Lisa Anderson", "555-0106", "987 Cedar Ln"),
            new (Id: 7, "Robert Taylor", "555-0107", "147 Birch Ave"),
            new (Id: 8, "Jennifer Martinez", "555-0108", "258 Willow St"),
            new (Id: 9, "William Thomas", "555-0109", "369 Spruce Rd"),
            new (Id: 10, "Maria Garcia", "555-0110", "741 Palm Blvd")
        };
    }

    public List<Models.Models.Tenant> GetTenants() => GenerateTenants();
}