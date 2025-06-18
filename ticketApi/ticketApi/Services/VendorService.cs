namespace ticketApi.Services;

public class VendorService
{
    private readonly List<Models.Models.Vendor> _suppliers;

    public VendorService()
    {
        _suppliers = new List<Models.Models.Vendor>
        {

            new Models.Models.Vendor(1, "plumbing", true, "Jose Plumbing",
                "Anything plumbing. We fix waterheaters, stuck toilets, dripping faucets and more",
                [new Models.Models.Contact("Jose Perez", "jose@joeplumbing.com", "111-456-7890", "sms")]),
            new Models.Models.Vendor(
                2, "plumbing", false, "Maris Plumbing", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Maris Joe", "maris@plumbing.com", "123-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                3, "plumbing", false, "Joes Plumbing", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Joe Johnson", "joe@plumbing.com", "222-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                4, "Electrical", true, "Mickey Electrical", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Mickey Michaels", "mickey@ele.com", "333-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                5, "Electrical", false, "Donald Electrical", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Don Harris", "don@elect.com", "444-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                6, "Electrical", false, "Joe Electrical", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Joe Smoe", "Joe@elect.com", "555-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                7, "HVAC", false, "Anuar Air conditioning", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Anuar Joe", "anu@hvac1.com", "666-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                8, "HVAC", false, "Total Air conditioning", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Mary Joe", "mary@hvac2.com", "777-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                9, "HVAC", false, "AllAir conditioning", "",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Oscar Yola", "oscar@hvac3.com", "888-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                10, "appliance", false, "Appliance Fix LLC", "We fix all kinds of appliances",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Hugo Martinez", "h@appliance.com", "101-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                11, "appliance", false, "QuickCool Appliance Repair", "Specialists in refrigerator and freezer repairs",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Linda Green", "linda@quickcool.com", "102-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                12, "pest control", false, "SafeHome Pest Solutions", "Eco-friendly pest control for homes and offices",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Peter Grant", "peter@safehomepest.com", "103-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                13, "pest control", false, "Bug Busters", "Termite, ant, and rodent extermination services",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Samantha Lee", "samantha@bugbusters.com", "104-456-7890", "sms")
                }
            ),
            new Models.Models.Vendor(
                14, "general", false, "HandyPro Services", "General handyman services for repairs and maintenance",
                new List<Models.Models.Contact>
                {
                    new Models.Models.Contact("Mark Wilson", "mark@handypro.com", "105-456-7890", "sms")
                }
            )
        };
    }

    public List<Models.Models.Vendor> GetSuppliers() => _suppliers;
}