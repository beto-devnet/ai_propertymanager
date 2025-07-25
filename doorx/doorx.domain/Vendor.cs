namespace doorx.domain;

public class Vendor
{
    public int Id { get; private set; }
    public string CompanyName { get; private set; }
    public string Description { get; private set; }
    public bool IsPreferred { get; private set; }
    public string PreferredMethodOfContact { get; private set; }
    
    public List<ContactVendor> Contacts { get; private set; }
    public Category Category { get; private set; }

    private Vendor(int id, Category category, bool isPreferred, string companyName, string description, List<ContactVendor> contacts)
    {
        Id = id;
        Category = category;
        IsPreferred = isPreferred;
        CompanyName = companyName;
        Description = description;
        PreferredMethodOfContact = "SMS";
        Contacts = contacts;
    }
    
    public static List<Vendor> GetAll()
    {
        var categories = Category.GetAll();
        return [
            new Vendor(1, 
                categories.First(x => x.Name == "Plumbing"), 
                true, 
                "Jose Plumbing",
                "Anything plumbing. We fix waterheaters, stuck toilets, dripping faucets and more",
                [new ContactVendor("Jose Perez", "jose@joeplumbing.com", "111-456-7890")]
            ),
            new Vendor(
                2, 
                categories.First(x => x.Name == "Plumbing"), 
                false, "Maris Plumbing", "",
                [new ContactVendor("Maris Joe", "maris@plumbing.com", "123-456-7890")]
                    
            ),
            new Vendor(
                3, 
                categories.First(x => x.Name == "Plumbing"), 
                false, 
                "Joes Plumbing", 
                "",
                [ new ContactVendor("Joe Johnson", "joe@plumbing.com", "222-456-7890") ]
            ),
            new Vendor(
                4, 
                categories.First(x => x.Name == "Electrical"), 
                true, 
                "Mickey Electrical", 
                "",
                [ new ContactVendor("Mickey Michaels", "mickey@ele.com", "333-456-7890") ]
            ),
            new Vendor(
                5, 
                categories.First(x => x.Name == "Electrical"), 
                false, "Donald Electrical", 
                "",
                [ new ContactVendor("Don Harris", "don@elect.com", "444-456-7890") ]
            ),
            new Vendor(
                6, 
                categories.First(x => x.Name == "Electrical"), 
                false, 
                "Joe Electrical", 
                "",
                [ new ContactVendor("Joe Smoe", "Joe@elect.com", "555-456-7890") ]
            ),
            new Vendor(
                7, 
                categories.First(x => x.Name == "HVAC"), 
                false, 
                "Jordan Air conditioning", 
                "",
                [ new ContactVendor("Jordan Conor", "anu@hvac1.com", "666-456-7890") ]
            ),
            new Vendor(
                8, 
                categories.First(x => x.Name == "HVAC"), 
                false, 
                "Total Air conditioning", 
                "",
                [ new ContactVendor("Mary Joe", "mary@hvac2.com", "777-456-7890") ]
            ),
            new Vendor(
                9, categories.First(x => x.Name == "HVAC"), 
                false, 
                "All Air conditioning", 
                "",
                [ new ContactVendor("Oscar Yola", "oscar@hvac3.com", "888-456-7890")]
            ),
            new Vendor(
                10, categories.First(x => x.Name == "Appliance"), 
                false, 
                "Appliance Fix LLC", 
                "We fix all kinds of appliances",
                [ new ContactVendor("Hugo Martinez", "h@appliance.com", "101-456-7890")]
            ),
            new Vendor(
                11, categories.First(x => x.Name == "Appliance"), 
                false, 
                "QuickCool Appliance Repair", 
                "Specialists in refrigerator and freezer repairs",
                [ new ContactVendor("Linda Green", "linda@quickcool.com", "102-456-7890")]
            ),
            new Vendor(
                12, 
                categories.First(x => x.Name == "Pest Control"), 
                    false, 
                    "SafeHome Pest Solutions", 
                    "Eco-friendly pest control for homes and offices",
                    [new ContactVendor("Peter Grant", "peter@safehomepest.com", "103-456-7890") ]
                ),
            new Vendor(
                13, 
            categories.First(x => x.Name == "Pest Control"), 
                false, 
                "Bug Busters", 
                "Termite, ant, and rodent extermination services",
                [new ContactVendor("Samantha Lee", "samantha@bugbusters.com", "104-456-7890")]
                ),
            new Vendor(
                14, 
                categories.First(x => x.Name == "General"), 
                false, 
                "HandyPro Services", 
                "General handyman services for repairs and maintenance",
                [ new ContactVendor("Mark Wilson", "mark@handypro.com", "105-456-7890")]
            )
        ];
    }
}