using System.ComponentModel;
using MCPServer.Services;
using System.Text.Json;
using ModelContextProtocol.Server;

namespace MCPServer;

[McpServerToolType]
public class McpTools
{
    [McpServerTool, Description("Return a List of Categories from api")]
    public static async Task<string> GetCategories(ApiService apiService)
    {
        apiService.SetEndpoint("category");
        var categories = await apiService.GetListAsync<Models.Category>("list");
        if (categories.IsError)
            return JsonSerializer.Serialize(new Models.StandardResponse<string>(categories.FirstError.Description, false));

        return JsonSerializer.Serialize(new Models.StandardResponse<List<Models.Category>>(categories.Value));
    }

    [McpServerTool, Description("Return a List of Vendors from api")]
    public static async Task<string> GetVendors(ApiService apiService)
    {
        apiService.SetEndpoint("vendor");
        var vendors = await apiService.GetListAsync<Models.Vendor>("list");
        if (vendors.IsError)
            return JsonSerializer.Serialize(new Models.StandardResponse<string>(vendors.FirstError.Description, false));

        return JsonSerializer.Serialize(new Models.StandardResponse<List<Models.Vendor>>(vendors.Value));
    }
    
    [McpServerTool, Description("Create a new Ticket")]
    public static async Task<string> CreateTicket(ApiService apiService, Models.Ticket ticket)
    {
        apiService.SetEndpoint("ticket");
        var result = await apiService.CreateAsync<Models.Ticket>("create", ticket);
        if (result.IsError)
            return JsonSerializer.Serialize(new Models.StandardResponse<string>(result.FirstError.Description, false));

        return JsonSerializer.Serialize(new Models.StandardResponse<Models.Ticket>(ticket));
    }
}