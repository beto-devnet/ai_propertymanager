using System.Text.Json;
using ticketApi.Models;
using ErrorOr;
using Microsoft.Extensions.Options;

namespace ticketApi.Services;

public class DemoActions
{
    private readonly CategoryService _categoryService;
    private readonly GeminiService _geminiService;
    private readonly VendorService _vendorService;
    // private readonly TenantService _tenantService;
    private readonly PropertyService _propertyService;
    private readonly AISettings _options;
    
    public DemoActions(CategoryService categoryService, GeminiService geminiService, VendorService vendorService, TenantService tenantService, IOptions<AISettings> options, PropertyService propertyService)
    {
        _categoryService = categoryService;
        _geminiService = geminiService;
        _vendorService = vendorService;
        // _tenantService = tenantService;
        _propertyService = propertyService;
        _options = options.Value;
    }

    public List<Models.Models.Example> GetExamples()
    {
        return new List<Models.Models.Example>()
        {
            new Models.Models.Example(1, "Ac Is not cooling"),
            new  Models.Models.Example(2, "There are ants in the kitchen"),
            new Models.Models.Example(3, "TV is not working")
        };
    }
    
    public List<Models.Models.PropertyBrief> GetAllPropertiesBrief => _propertyService.GetPropertiesBrief();
    public List<Models.Models.Property2> GetAllProperties => _propertyService.GetProperties2();
    public ErrorOr<Models.Models.Property2> Login(int propertyId)
    {
        var property = _propertyService.GetProperties2().FirstOrDefault(x => x.Id == propertyId); 
        return property is null ? Error.NotFound() : property; 
    }

    public async Task<ErrorOr<IssueResponseFull>> ProcessIssue(Models.Models.AssistantRequest request)
    {
        var property =  _propertyService.GetProperties2().First(x => x.Id == request.UserId);
        var tenant = property.Tenant;
        
        var clauses = _propertyService.GetLeaseAgreementClauses(property.Id);
        var clausesString = String.Empty;
        if (clauses.Any())
        {
            foreach (var clause in clauses)
            {
                clausesString += @$"

                    - Category: {clause.Category}, clause: {clause.Clause}.";
            }
        }
        
        var categories = "";
        foreach (var category in _categoryService.Categories)
            categories += $"- {category.Name} \n";

        var prompt = $@"Based on the following issue: 
        {request.IssueDescription}. 
        
        Please, assign the correct category from the following list: 
        {categories}";

        if (clausesString != string.Empty)
        {
            prompt += @$"

                    Also, Identify the resolution responsibility from the following leasing clauses:
                    {clausesString}

                    Response with 'Tenant', 'Landlord', or 'Unknown'.

                    ";
        }
    
        prompt += "Finally, return a warm response to customer. It is important to greet the tenant warmly and include any commentary or explanation that helps them understand you are here to assist and ensure a timely resolution of their request.";

        var response = _options.UseFakeResponses ? await _geminiService.GenerateTextAsyncFake(prompt) : await _geminiService.ProcessPrompt<Gemini.IssueResponse>(prompt);
        if (response.IsError)
            return response.FirstError;

        var responseFull = new IssueResponseFull(response.Value.Category, request.IssueDescription, tenant.Name, tenant.Telephone, property.Address, response.Value.Response, response.Value.ResolutionResponsibility, "Next Step");
        // responseFull.SetDate();
        // responseFull.SetResponse(response.Value.Response);
        
        return responseFull;
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
            var response = await AvailabilityMessage(request, _options.UseFakeResponses);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Vendor Confirm Visit to Tenant")
        {
            var response = await DateAndTimeForVendorVisit(request, _options.UseFakeResponses);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Vendor Confirm Issue was fixed")
        {
            var response = await ConfirmIssueWasFixed(request, _options.UseFakeResponses);
            return new Demo.Message.ReceiveMessageResponse(response);
        }
        else if (request.Step == "Tenant confirmed Issue was fixed")
        {
            var response = await TenantConfirmIssueWasFixed(request, _options.UseFakeResponses);
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
        var property = _propertyService.GetProperties2().First(t => t.Id == request.UserId);
        var tenant = property.Tenant;
        
        var message = @$"Hi {vendor.Contacts.First().Name}, this is Aimee from Mila Realty. We have and {request.Category} issue at
                            {property.Address} (tenant {tenant.Name} - {tenant.Telephone}). 
                            
                            The issue description is the following:
                            {request.Issue}.

        Can you take this job and contact the tenant directly to schedule a time that works for both of you?.

        Please, reply to confirm you are available";
        return await Task.FromResult(new Demo.Models.AskForAvailabilityResponse(message, DateTime.Now.ToString("MM-dd HH:mm")));
    }

    private async Task<Demo.Models.VendorMessageAvailabilityResponse> AvailabilityMessage(Demo.Message.ReceiveMessageRequest request, bool useFakeResponse)
    {
        var prompt = @$"Aimee message: {request.AimeeMessage}. 
                        Vendor response: {request.MessageToAime}. 
                        
                        It is a positively response from vendor to take the job and contact to the client or is it needed to ask to other vendor for their availability";
     
        var response = useFakeResponse ? await _geminiService.FakeAvailabilityResponse(prompt) : await _geminiService.ProcessPrompt<Gemini.AvailabilityResponse>(prompt);
        if (response.IsError)
            return new Demo.Models.VendorMessageAvailabilityResponse(false, "Not available", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.VendorMessageAvailabilityResponse(response.Value.IsAvailable, response.Value.Response, DateTime.Now.ToString("MM-dd HH:mm"));
    }

    private async Task<Demo.Models.InformTenantContactFromVendorResponse> InformTenantFromVendorContact(
        Demo.Models.InformTenantContactFromVendor request)
    {
        var vendor = _vendorService.GetSuppliers().First(v => v.Id == request.VendorId);
        var property = _propertyService.GetProperties2().First(t => t.Id == request.TenantId);
        var tenant = property.Tenant;

        var message =
            @$"Hi {tenant.Name}. 
            Quick Update: {vendor.Contacts.First().Name} from {vendor.CompanyName} will be reaching you out shortly to coordinate a time that works best for both of you";
        return new Demo.Models.InformTenantContactFromVendorResponse(message, DateTime.Now.ToString("MM-dd HH:mm"));
    }

    private async Task<Demo.Models.TenantScheduledVisitResponse> DateAndTimeForVendorVisit(Demo.Message.ReceiveMessageRequest request, bool useFakeResponse)
    {
        var prompt = @$"According to the message from a vendor: {request.MessageToAime}. 
                        I need to get the date and time of the scheduled visit with the tenant in case of the vendor has scheduled a visit. 
                        Return the date in format yyyy-MM-dd and the time in formant HH:mm. Also return a boolean value if the visit was scheduled.
                        In case of the date and time was not clear or you was not able to determinate a success response for a visit time, return a boolean value in false.";
        
        var response = useFakeResponse ?  await _geminiService.DateTimeScheduledVisitFake(prompt) : await _geminiService.ProcessPrompt<Gemini.DateAndTime>(prompt);
        if (response.IsError)
            return new Demo.Models.TenantScheduledVisitResponse(false, DateOnly.FromDateTime(DateTime.MaxValue), TimeOnly.FromDateTime(DateTime.MaxValue), DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.TenantScheduledVisitResponse(response.Value.IsScheduled, DateOnly.Parse(response.Value.ScheduleDate), TimeOnly.Parse(response.Value.ScheduleTime), DateTime.Now.ToString("MM-dd HH:mm"));
    }
    
    private async Task<Demo.Models.VendorFixedIssueResponse> ConfirmIssueWasFixed(Demo.Message.ReceiveMessageRequest request, bool useFakeResponse)
    {
        var prompt = @$"According to the message from a vendor: {request.MessageToAime}. 
                        I need to validate if the issue was successfully fixed. If the issue was fixed, then, response kindly and warm to the vendor about to work with them was good.
                        In case that the vendor was not able to fix the issue, return a according response to the vendor.
Also, return a boolean value in case that issue was fixed or not.";
        
        var response = useFakeResponse ? await _geminiService.IssueFixedFake(prompt) : await _geminiService.ProcessPrompt<Gemini.VendorFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.VendorFixedIssueResponse(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.VendorFixedIssueResponse(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
    
    private async Task<Demo.Models.TenantConfirmedFixedIssue> TenantConfirmIssueWasFixed(Demo.Message.ReceiveMessageRequest request, bool useFakeReponse)
    {
        var prompt = $"According to the message from a tenant: {request.MessageToAime}. I need to validate id the issue was successfully fixed. If the issue was fixed, then, response kindly and warm to the tenant about to inform the issue is fixed.";
        
        var response =  useFakeReponse ? await _geminiService.TenantConfirmedIssueFixedFake(prompt) : await _geminiService.ProcessPrompt<Gemini.TenantFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.TenantConfirmedFixedIssue(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.TenantConfirmedFixedIssue(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
}