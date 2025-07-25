namespace doorx.domain;

public class Ticket
{
    public int Id { get; set; }
    public string IssueDescription { get; set; }

    public Category? Category { get; set; } = null;

    private Ticket(int id, string issue)
    {
        Id = id;
        IssueDescription = issue;
    }
    
    public static List<Ticket> GetExamples() =>
    [
        new Ticket(1, "The AC is not cooling properly"),
        new Ticket(2, "There are ants in the kitchen"),
        new Ticket(3, "The TV is not working"),
    ];
}