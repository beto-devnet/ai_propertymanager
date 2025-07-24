namespace doorx.domain;

public class Tenant
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Telephone { get; set; }


    private Tenant(int id, string name, string telephone)
    {
        Id = id;
        Name = name;
        Telephone = telephone;
    }

    public static List<Tenant> GetAll()
    {
        return
        [
            new Tenant(1, "Anaur Bajos", "123-456-7890"),
            new Tenant(2, "Douglas Loyo", "234-567-8901"),
            new Tenant(3, "Joe Smoe", "345-678-9012"),
            new Tenant(4, "Maria Vega", "456-789-0123"),
            new Tenant(5, "Jaime Martinez", "005-456-7890"),
            new Tenant(6, "Yadira Diez", "006-456-7890")
        ];
    }
}
