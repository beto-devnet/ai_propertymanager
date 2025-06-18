namespace ticketApi.Services;

public class CategoryService
{
    private readonly List<Models.Models.Category> _categories;
    public CategoryService()
    {
        _categories = new List<Models.Models.Category>();
        _categories.Add(new Models.Models.Category("Plumbing","description of appliance category"));
        _categories.Add(new Models.Models.Category("Electrical","description of heating and cooling category"));
        _categories.Add(new Models.Models.Category("Appliances","description of heating and cooling category"));
        _categories.Add(new Models.Models.Category("Heating & Cooling","description of heating and cooling category"));
        _categories.Add(new Models.Models.Category("Pest Control","description of heating and cooling category"));
        _categories.Add(new Models.Models.Category("General","description of general category"));
    }
    
    public List<Models.Models.Category> Categories => _categories;
}