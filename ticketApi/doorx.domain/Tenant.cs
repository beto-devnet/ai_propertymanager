namespace doorx.domain;

public class Tenant
{
    public string Name { get; set; }
    public string Telephone { get; set; }


    private Tenant(string name, string telephone)
    {
        Name = name;
        Telephone = telephone;
    }

    public static List<Tenant> GetAll()
    {
        return
        [
            new Tenant("Anaur Bajos", "123-456-7890"),
            new Tenant("Douglas Loyo", "234-567-8901"),
            new Tenant("Joe Smoe", "345-678-9012"),
            new Tenant("Maria Vega", "456-789-0123")
        ];
    }
}
