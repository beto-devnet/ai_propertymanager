namespace doorx.domain;

public class Property
{
    public int Id { get; set; } 
    public string Address { get; set; } 
    public string Landlord { get; set; }
    
    public Tenant Tenant { get; set; } 
    public List<LeaseAgreementClause> ImportantContractObligations { get; set; }

    public Property() { }
    
    public Property(int id, string address, Tenant tenant, string landlord, List<LeaseAgreementClause> importantContractObligations)
    {
        Id = id;
        Address = address;
        Tenant = tenant;
        Landlord = landlord;
        ImportantContractObligations = importantContractObligations;
    }

    public static List<Property> GetAll()
    {
        var tenantList = Tenant.GetAll();
        return [
            new Property(1, 
                "106 Bluejay dr. Orlando FL 32189", 
                tenantList[0], 
                "D LLC", 
                [new LeaseAgreementClause("pest control", "As per the contract is in charge of all pest control issues.")] 
            ),
            new Property(2,
                "5421 Rustic Pine Orlando FL 32189",
                tenantList[1],
                "A LLC",
                [new LeaseAgreementClause("pest control", "As per the contract the landlord is in charge of all pest control issues.")]
            ),
            
            new Property(3,
                "16 Vineland, Orlando FL 32189",
                tenantList[2],
                "B LLC",
                []),
            
            new Property(4,
                "69 Cool dr. Orlando FL 32189",
                tenantList[3],
                "C LLC",
                []),
            
            new Property(5,
                "13 Prairie Dr, Orlando, FL 32819",
                tenantList[4],
                "XYZ LLC",
                [new LeaseAgreementClause("pest control", "As per the contract the tenant is in charge of all pest control issues.")]
            ),
            
            new Property(6,
                "111 Fountainhead Cir, Kissimmee 34741",
                tenantList[5],
                "C LLC",
                [])
        ];
    }
}