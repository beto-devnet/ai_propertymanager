namespace doorx.domain;

public class LeaseAgreementClause
{
    public string Category { get; set; }
    public string Clause { get; set; }

    public LeaseAgreementClause(string category, string cluse)
    {
        Category = category;
        Clause = cluse;
    }
}