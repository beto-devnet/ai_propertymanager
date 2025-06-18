namespace ticketApi.Services;

public class SupplierService
{
    private readonly List<Models.Models.Vendor> _suppliers;

    public SupplierService()
    {
        _suppliers = new List<Models.Models.Vendor>
        {
            new (Id: Guid.NewGuid().ToString(), Category: "Plumbing", Name:"Jose Plumbing", DescriptionOfServices: "Anything plumbing. We fix waterheaters, stuck toilets, dripping faucets and more"), 
            new (Id: Guid.NewGuid().ToString(), Category:"Plumbing", Name: "Maris Plumbing", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"Plumbing", Name: "Joes Plumbing", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"Electrical", Name: "Mickey Electrical", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"Electrical", Name: "Donald Electrical", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"Electrical", Name: "Joe Electrical", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"HVAC", Name: "Anuar Air conditioning", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"HVAC", Name: "Total Air conditioning", DescriptionOfServices:""), 
            new (Id: Guid.NewGuid().ToString(), Category:"HVAC", Name: "AllAir conditioning", DescriptionOfServices:"")
        };
    }

    public List<Models.Models.Vendor> GetSuppliers() => _suppliers;
}