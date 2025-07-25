namespace doorx.domain;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public Category() { }

    protected Category(int id, string name, string description)
    {
        Id = id;
        Name = name; 
        Description = description;
    }
    
    public static List<Category> GetAll()
    {
        return
        [
            new Category(1, "Plumbing", "Issues related to water systems, pipes, drains, faucets, toilets, and water heaters"),
            new Category(2, "Electrical", "Problems with electrical systems, wiring, outlets, lighting, and circuit breakers"),
            new Category(3, "Appliance", "Repairs and maintenance for kitchen and laundry appliances including refrigerators, dishwashers, washers, and dryers"),
            new Category(4, "HVAC", "HVAC system issues including air conditioning, heating, ventilation, and temperature control"),
            new Category(5, "Pest Control", "Services for managing and preventing infestations of insects, rodents, and other unwanted pests"),
            new Category(6, "General", "General maintenance and repairs not covered by other specific categories")
        ];
    }
}