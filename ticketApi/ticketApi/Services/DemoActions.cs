using System.Text.Json;
using NuGet.Protocol;
using ticketApi.Models;

namespace ticketApi.Services;

public class DemoActions
{
    private readonly CategoryService _categoryService;
    private readonly GeminiService _geminiService;
    private readonly VendorService _vendorService;
    private readonly TenantService _tenantService;
    
    public DemoActions(CategoryService categoryService, GeminiService geminiService, VendorService vendorService, TenantService tenantService)
    {
        _categoryService = categoryService;
        _geminiService = geminiService;
        _vendorService = vendorService;
        _tenantService = tenantService;
    }
    
    public async Task<Demo.Message.SendMessageResponse> SendMessage(Demo.Message.SendMessageRequest request)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = null
        };
        
        if (request.Step == "ask for availability")
        {
            var payloadJson = (JsonElement)request.Request;
            var req = JsonSerializer.Deserialize<Demo.Models.AskForAvailability>(payloadJson.GetRawText(), options);
            
            var response = await AskForAvailability(req);
            return new Demo.Message.SendMessageResponse(response);
        }
        return new Demo.Message.SendMessageResponse(new {});
    }

    public async Task<Models.Models.Vendor> GetRandomVendor(string category)
    {
        var vendors = _vendorService.GetSuppliers().Where(x => x.Category.Trim().ToLower() == category.Trim().ToLower()).ToList();
        
        if(vendors.Count == 1)
            return await Task.FromResult(vendors.First());

        var preferred = vendors.FirstOrDefault(v => v.PreferedVendor);
        if(preferred is not null)
            return await Task.FromResult(preferred);
        
        var random = new Random();
        var vendorIndex = random.Next(1, vendors.Count);
        return await Task.FromResult(vendors[vendorIndex]);
    }
    
    private async Task<Demo.Models.AskForAvailabilityResponse> AskForAvailability(Demo.Models.AskForAvailability request)
    {
        var vendor = _vendorService.GetSuppliers().First(v => v.Id == request.VendorId);
        var tenant = _tenantService.GetTenants().First(t => t.Id == request.UserId);
        
        var message = @$"Hi {vendor.Contacts.First().Name}, this is Aimee from Mila Realty. We have and {request.Category} issue at
                            13 Prairie Dr. Orlando (tenant {tenant.Name} - {tenant.Phone}). 
                            
                            The issue description is the following:
                            {request.Issue}.

        Can you take this job and contact the tenant directly to schedule a time that works for both of you?.

        Please, reply to confirm you are available";
        return await Task.FromResult(new Demo.Models.AskForAvailabilityResponse(message, DateTime.Now.ToString("MM-dd HH:mm")));
    }
}