namespace doorx.application.OpenAI.Requests;

// public record IssueRequest(string TicketId, string TenantName, string Address);
public record IssueRequest(string TenantName, string IssueDescription, string ThreadId);