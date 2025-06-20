using ErrorOr;
using ticketApi.Models;

namespace ticketApi.Services;

public class DemoServices
{
    private readonly CategoryService _categoryService;
    private readonly GeminiService _geminiService;
    private readonly VendorService _vendorService;
    

    public DemoServices(CategoryService categoryService, GeminiService geminiService, VendorService vendorService)
    {
        _categoryService = categoryService;
        _geminiService = geminiService;
        _vendorService = vendorService;
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

    public async Task<ErrorOr<IssueResponseFull>> ProcessIssue(Models.Models.AssistantRequest request)
    {
        var categories = "";
        foreach (var category in _categoryService.Categories)
            categories += $"- {category.Name} \n";

        var prompt = $@"Based on the following issue: 
        {request.IssueDescription}. 
        
        Please, assign the correct category from the following list: 
        {categories}
        
        Also, return a warm response to customer";

        var response = await _geminiService.GenerateTextAsyncFake(prompt);
        // var response = await _geminiService.ProcessTenantIssue<Gemini.IssueResponse>(prompt);
        if (response.IsError)
            return response.FirstError;

        var responseFull = new IssueResponseFull(response.Value.Category, request.IssueDescription, request.User, "123-456-4560", "Next Step");
        responseFull.SetDate();
        responseFull.SetResponse(response.Value.Response);
        
        return responseFull;
    }

    public async Task<ErrorOr<Demo.ServiceAvailabilityResponse>> ServiceAvailabilityMessage(Demo.ServiceAvailabilityRequest request)
    {
        var vendors = _vendorService.GetSuppliers().Where(x => x.Category.ToLower() == request.Category.ToLower()).ToList();
        Models.Models.Vendor vendor = null;
        if(vendors.Count == 1)
            vendor = vendors.First();

        var random = new Random();
        var vendorIndex = random.Next(1, vendors.Count);
        vendor = vendors[vendorIndex];
        var requestMessage = @$"Hi {vendor.Contacts.First().Name}, this is Aimee from Mila Realty. We have and {request.Category} issue at
                            13 Prairie Dr. Orlando (tenant {request.User} - {request.Phone}). 
                            
                            {request.Issue}.

        Can you take this job and contact the tenant directly to schedule a time that works for both of you?.

        Please, reply to confirm you are available";
                
        return await Task.FromResult(new Demo.ServiceAvailabilityResponse(requestMessage, DateTime.UtcNow.ToLongDateString(), vendor.Id));
    }

    public async Task<Demo.VendorAvailabilityResponse> GetVendorAvailabilityResponse()
    {
        var response = new Demo.VendorAvailabilityResponse("Hi Aimee, Yes I am available and I will take the job. I will contact the tenant ASAP", DateTime.UtcNow.ToLongDateString(), true);
        return await Task.FromResult(response);
    }
    
    public async Task<Demo.InformTenantVendorContactResponse> InformTenantAboutVendorContact(Demo.InformTenantVendorContact request)
    {
        var vendor = _vendorService.GetSuppliers().First(x => x.Id == request.VendorId);
        var message = $"Hi {request.User}, Quick update. {vendor.Contacts.First().Name} from {vendor.CompanyName} will be reaching you out shortly to coordinate a time that works best for both of you";
        var response = new Demo.InformTenantVendorContactResponse(message, DateTime.UtcNow.ToLongDateString());
        return await Task.FromResult(response);
    }

    public async Task<Demo.VendorMessageToAgent> VendorConfirmScheduledVisit()
    {
        var message = "Hi Aimee. I called the tenant and I am going to swing  by today around 4pm. I'll let you know once I have a diagnosis";
        return await Task.FromResult(new Demo.VendorMessageToAgent(message, DateTime.UtcNow.ToLongDateString()));
    }

    public async Task<Demo.AimeeMessageToTenantResponse> InformTenantAboutVisitTime(Demo.AimeeMessageToTenantRequest request)
    {
        var vendor = _vendorService.GetSuppliers().First(x => x.Id == request.VendorId);
        var message =
            $"Hi {request.User}. {vendor.Contacts.First().Name} from {vendor.CompanyName} mentioned he spoked with you and plans to be there today around 4pm. I'll keep you posted if anything change.";
        
        return await Task.FromResult(new Demo.AimeeMessageToTenantResponse(message, DateTime.UtcNow.ToLongDateString()));
    }

    public async Task<Demo.FixHasCompletedResponse> FixHasCompleted(Demo.FixHasCompletedRequest request)
    {
        return await Task.FromResult(new Demo.FixHasCompletedResponse(request.Message, DateTime.UtcNow.ToLongDateString()));
    }
    
    public async Task<Demo.ReplyToVendorIssueFixedResponse> ReplyToVendorIssueFixed(Demo.ReplyToVendorIssueFixedRequest request)
    {
        var vendor = _vendorService.GetSuppliers().First(x => x.Id == request.VendorId);
        var message = $"Thank you so much, {vendor.Contacts.First().Name}. Its always a pleasure to work with you and yor team.";
        return await Task.FromResult(new Demo.ReplyToVendorIssueFixedResponse(message, DateTime.UtcNow.ToLongDateString()));
    }
    
    public async Task<Demo.MessageToTenantCloseTicketResponse> MessageToTenantCloseTicket(Demo.MessageToTenantCloseTicketRequest request)
    {
        var vendor = _vendorService.GetSuppliers().First(x => x.Id == request.VendorId);
        var message = $"Hi, {request.User}. Looks like {vendor.Contacts.First().Name} has fixed the issue. Can you confirm that so we can close the ticket?";
        return await Task.FromResult(new Demo.MessageToTenantCloseTicketResponse(message, DateTime.UtcNow.ToLongDateString()));
    }
    
    public async Task<Demo.TenantResponseToCloseTicketResponse> TenantResponseCloseTicket(Demo.TenantResponseToCloseTicketRequest request)
    {
        return await Task.FromResult(new Demo.TenantResponseToCloseTicketResponse(request.Message, DateTime.UtcNow.ToLongDateString()));
    } 
}