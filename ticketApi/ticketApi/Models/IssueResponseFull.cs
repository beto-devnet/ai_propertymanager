namespace ticketApi.Models;

public interface AiMessageResponse
{
    public string Response { get; set; }
    public string Date { get; set; }
}

public class MessageResponseBase: AiMessageResponse
{
    public string Response { get; set; }
    public string Date { get; set; }
    
    public void SetResponse(string response) => Response = response;
    public void SetDate() => Date = DateTime.Now.ToShortDateString();
}

public class IssueResponseFull(string category, string issue, string tenantName, string phone, string step): MessageResponseBase
{
    public string Category { get; init; } = category; 
    public string Issue { get; init; } = issue; 
    public string TenantName { get; init; } = tenantName; 
    public string Phone { get; init; } = phone; 
    public string Step { get; init; } = step; 
}