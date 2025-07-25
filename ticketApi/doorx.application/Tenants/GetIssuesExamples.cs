using doorx.application.Common;
using doorx.domain;

namespace doorx.application.Tenants;

public class GetIssuesExamples: IUseCase
{
    public record Response(int Id, string Issue);
    
    public List<Response> Execute() =>
        Ticket
            .GetExamples()
            .Select(ticket => new Response(ticket.Id, ticket.IssueDescription))
            .ToList();
}