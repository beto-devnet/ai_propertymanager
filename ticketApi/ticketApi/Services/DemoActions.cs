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

    public Models.Models.Tenant GetRandomTenant()
    {
        var tenants = _tenantService.GetTenants();
        var random = new Random();
        var randomIndex = random.Next(tenants.Count);
        
        return tenants[randomIndex];
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
        else if (request.Step == "Response to Tenant")
        {
            var payloadJson = (JsonElement)request.Request;
            var req = JsonSerializer.Deserialize<Demo.Models.InformTenantContactFromVendor>(payloadJson.GetRawText(), options);
            
            var response = await InformTenantFromVendorContact(req);
            return new Demo.Message.SendMessageResponse(response);
        }
        
        return new Demo.Message.SendMessageResponse(new {});
    }

    public async Task<Demo.Message.ReceiveMessageResponse> ReceiveMessage(Demo.Message.ReceiveMessageRequest request)
    {
        if (request.Step == "availability response")
        {
            var response = await AvailabilityMessage(request);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Vendor Confirm Visit to Tenant")
        {
            var response = await DateAndTimeForVendorVisit(request);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Vendor Confirm Issue was fixed")
        {
            var response = await ConfirmIssueWasFixed(request);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Tenant confirmed Issue was fixed")
        {
            var response = await TenantConfirmIssueWasFixed(request);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        
        
        return new Demo.Message.ReceiveMessageResponse(new {});
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
                            {tenant.Address} (tenant {tenant.Name} - {tenant.Phone}). 
                            
                            The issue description is the following:
                            {request.Issue}.

        Can you take this job and contact the tenant directly to schedule a time that works for both of you?.

        Please, reply to confirm you are available";
        return await Task.FromResult(new Demo.Models.AskForAvailabilityResponse(message, DateTime.Now.ToString("MM-dd HH:mm")));
    }

    private async Task<Demo.Models.VendorMessageAvailabilityResponse> AvailabilityMessage(Demo.Message.ReceiveMessageRequest request)
    {
        var prompt = @$"Aimee message: {request.AimeeMessage}. 
                        Vendor response: {request.MessageToAime}. 
                        
                        It is a positively response from vendor to take the job and contact to the client or is it needed to ask to other vendor for their availability";
     
        var response = await _geminiService.FakeAvailabilityResponse(prompt);
        // var response = await _geminiService.ProcessPrompt<Gemini.AvailabilityResponse>(prompt);
        if (response.IsError)
            return new Demo.Models.VendorMessageAvailabilityResponse(false, "Not available", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.VendorMessageAvailabilityResponse(response.Value.IsAvailable, response.Value.Response, DateTime.Now.ToString("MM-dd HH:mm"));
    }

    private async Task<Demo.Models.InformTenantContactFromVendorResponse> InformTenantFromVendorContact(
        Demo.Models.InformTenantContactFromVendor request)
    {
        var vendor = _vendorService.GetSuppliers().First(v => v.Id == request.VendorId);
        var user = _tenantService.GetTenants().First(t => t.Id == request.TenantId);

        var message =
            @$"Hi {user.Name}. 
            Quick Update: {vendor.Contacts.First().Name} from {vendor.CompanyName} will be reaching you out shortly to coordinate a time that works best for both of you";
        return new Demo.Models.InformTenantContactFromVendorResponse(message, DateTime.Now.ToString("MM-dd HH:mm"));
    }

    private async Task<Demo.Models.TenantScheduledVisitResponse> DateAndTimeForVendorVisit(Demo.Message.ReceiveMessageRequest request)
    {
        var prompt = $"According to the message from a vendor: {request.MessageToAime}. I need to get the date and time of the scheduled visit with the tenant. Return the date in format yyyy-MM-dd and the time in formant HH:mm";
        var response = await _geminiService.DateTimeScheduledVisitFake(prompt);
        // var response = await _geminiService.ProcessPrompt<Gemini.DateAndTime>(prompt);
        if (response.IsError)
            return new Demo.Models.TenantScheduledVisitResponse(DateOnly.FromDateTime(DateTime.MaxValue), TimeOnly.FromDateTime(DateTime.MaxValue), DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.TenantScheduledVisitResponse(DateOnly.Parse(response.Value.ScheduleDate), TimeOnly.Parse(response.Value.ScheduleTime), DateTime.Now.ToString("MM-dd HH:mm"));
    }
    
    private async Task<Demo.Models.VendorFixedIssueResponse> ConfirmIssueWasFixed(Demo.Message.ReceiveMessageRequest request)
    {
        var prompt = $"According to the message from a vendor: {request.MessageToAime}. I need to validate if the issue was successfully fixed. If the issue was fixed, then, response kindly and warm to the vendor about to work with them was good.";
        var response = await _geminiService.IssueFixedFake(prompt);
        // var response = await _geminiService.ProcessPrompt<Gemini.VendorFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.VendorFixedIssueResponse(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.VendorFixedIssueResponse(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
    
    private async Task<Demo.Models.TenantConfirmedFixedIssue> TenantConfirmIssueWasFixed(Demo.Message.ReceiveMessageRequest request)
    {
        var prompt = $"According to the message from a tenant: {request.MessageToAime}. I need to validate id the issue was successfully fixed. If the issue was fixed, then, response kindly and warm to the tenant about to inform the issue is fixed.";
        
        var response = await _geminiService.IssueFixedFake(prompt);
        // var response = await _geminiService.ProcessPrompt<Gemini.TenantFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.TenantConfirmedFixedIssue(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.TenantConfirmedFixedIssue(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
}