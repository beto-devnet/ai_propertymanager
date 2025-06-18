namespace ticketApi.Services;

public class PropertyService
{
    private readonly List<Models.Models.Property> _properties;

    public PropertyService()
    {
        _properties = new List<Models.Models.Property>
        {
            new(Address: "106 Bluejay dr. Orlando FL 32189", Tenant:"Anaur Bajos", Landlord: "D LLC", ImportantContractObligations:"As per the contract theTenantis in charge of all pest control issues." ),
            new(Address: "5421 Rustic Pine Orlando FL 32189", Tenant:"Douglas Loyo", Landlord: "A LLC", ImportantContractObligations:"As per the contract the landlord is in charge of all pest control issues." ),
            new(Address: "16 Vineland, Orlando FL 32189", Tenant:"Joe Smoe", Landlord: "B LLC", ImportantContractObligations:"" ),
            new(Address: "69 Cool dr. Orlando FL 32189", Tenant:"Maria Vega", Landlord: "C LLC", ImportantContractObligations:"" )
        };
    }
    
    public List<Models.Models.Property> GetProperties() => _properties;
}