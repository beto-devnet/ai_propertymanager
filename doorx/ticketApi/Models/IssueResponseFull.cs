namespace ticketApi.Models;

public interface AiMessageResponse
{
    public string Response { get; set; }
    public string Time { get; set; }
}

public class MessageResponseBase: AiMessageResponse
{
    public string Response { get; set; }
    public string Time { get; set; }
    
    public void SetResponse(string response) => Response = response;
    public void SetDate() => Time = DateTime.Now.ToString("MM-dd HH:mm");
}

public record IssueResponseFull(
    string category,
    string issue,
    string tenantName,
    string phone,
    string address,
    string Response,
    string ResolutionResponsibility,
    string step);
//: MessageResponseBase
// {
//     public string Category { get; init; } = category; 
//     public string Issue { get; init; } = issue; 
//     public string TenantName { get; init; } = tenantName; 
//     public string Phone { get; init; } = phone; 
//     public string Address { get; init; } = address; 
//     public string Step { get; init; } = step; 
// }