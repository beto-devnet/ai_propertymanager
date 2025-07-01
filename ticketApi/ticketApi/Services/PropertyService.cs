namespace ticketApi.Services;

public class PropertyService
{
    private readonly List<Models.Models.Property> _properties;
    
    private readonly List<Models.Models.Property2> _properties2;

    public PropertyService()
    {
        _properties = new List<Models.Models.Property>
        {
            new(Address: "106 Bluejay dr. Orlando FL 32189", Tenant:"Anaur Bajos", Landlord: "D LLC", ImportantContractObligations:"As per the contract theTenantis in charge of all pest control issues." ),
            new(Address: "5421 Rustic Pine Orlando FL 32189", Tenant:"Douglas Loyo", Landlord: "A LLC", ImportantContractObligations:"As per the contract the landlord is in charge of all pest control issues." ),
            new(Address: "16 Vineland, Orlando FL 32189", Tenant:"Joe Smoe", Landlord: "B LLC", ImportantContractObligations:"" ),
            new(Address: "69 Cool dr. Orlando FL 32189", Tenant:"Maria Vega", Landlord: "C LLC", ImportantContractObligations:"" )
        };

        _properties2 = new List<Models.Models.Property2>
        {
            new Models.Models.Property2(1, 
                "106 Bluejay dr. Orlando FL 32189", 
                new Models.Models.Tenant2("Anuar Bajos", "001-456-7890"), 
                "D LLC",
                [
                    new Models.Models.LeaseAgreementClause("pest control",
                        "As per the contract the tenant is in charge of all pest control issues.")
                ]
            ),
            
            new Models.Models.Property2(2,
            "5421 Rustic Pine Orlando FL 32189",
            new Models.Models.Tenant2("Douglas Loyo", "002-456-7890"),
            "A LLC",
            [
                new Models.Models.LeaseAgreementClause("pest control",
                    "As per the contract the landlord is in charge of all pest control issues.")
            ]),
            
            new Models.Models.Property2(3,
                "16 Vineland, Orlando FL 32189",
                new Models.Models.Tenant2("Joe Smoe", "003-456-7890"),
                "B LLC",
                []),
            
            new Models.Models.Property2(4,
                "69 Cool dr. Orlando FL 32189",
                new Models.Models.Tenant2("Maria Vega", "004-456-7890"),
                "C LLC",
                []),
            
            new Models.Models.Property2(5,
                "13 Prairie Dr, Orlando, FL 32819",
                new Models.Models.Tenant2("Jaime Martinez", "005-456-7890"),
                "XYZ LLC",
                [
                    new Models.Models.LeaseAgreementClause("pest control",
                        "As per the contract the tenant is in charge of all pest control issues.")
                ]),
            
            new Models.Models.Property2(6,
                "111 Fountainhead Cir, Kissimmee 34741",
                new Models.Models.Tenant2("Yadira Diez", "006-456-7890"),
                "C LLC",
                [])
        };
    }
    
    public List<Models.Models.PropertyBrief> GetPropertiesBrief() => _properties2.Select(x => new Models.Models.PropertyBrief(x.Id, x.Tenant.Name)).ToList();
    public List<Models.Models.Property2> GetProperties2() => _properties2;
}