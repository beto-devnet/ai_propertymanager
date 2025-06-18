namespace ticketApi.Services;

public class CategoryService
{
    private readonly List<Models.Models.Category> _categories;
    public CategoryService()
    {
        _categories = new List<Models.Models.Category>();
        _categories.Add(new Models.Models.Category("Plumbing", "Issues related to water systems, pipes, drains, faucets, toilets, and water heaters"));
        _categories.Add(new Models.Models.Category("Electrical", "Problems with electrical systems, wiring, outlets, lighting, and circuit breakers"));
        _categories.Add(new Models.Models.Category("Appliance", "Repairs and maintenance for kitchen and laundry appliances including refrigerators, dishwashers, washers, and dryers"));
        _categories.Add(new Models.Models.Category("HVAC", "HVAC system issues including air conditioning, heating, ventilation, and temperature control"));
        _categories.Add(new Models.Models.Category("Pest Control", "Services for managing and preventing infestations of insects, rodents, and other unwanted pests"));
        _categories.Add(new Models.Models.Category("General", "General maintenance and repairs not covered by other specific categories"));
    }
    
    public List<Models.Models.Category> Categories => _categories;
}