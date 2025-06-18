using ErrorOr;
using ticketApi.Models;

namespace ticketApi.Services;

public class DemoServices
{
    private readonly CategoryService _categoryService;
    private readonly GeminiService _geminiService;
    private readonly SupplierService _supplierService;

    public DemoServices(CategoryService categoryService, GeminiService geminiService, SupplierService supplierService)
    {
        _categoryService = categoryService;
        _geminiService = geminiService;
        _supplierService = supplierService;
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

        var response = await _geminiService.GenerateTextAsyncFake(prompt); //await _geminiService.GenerateTextAsync<Gemini.IssueResponse>(prompt);
        if (response.IsError)
            return response.FirstError;

        var responseFull = new IssueResponseFull(response.Value.Category, request.IssueDescription, request.User, "123-456-4560", "Next Step");
        responseFull.SetDate();
        responseFull.SetResponse(response.Value.Response);
        
        return responseFull;
    }

    public async Task<ErrorOr<Demo.ServiceAvailabilityResponse>> ServiceAvailabilityMessage(Demo.ServiceAvailabilityRequest request)
    {
        var vendor = _supplierService.GetSuppliers().First();
        var requestMessage = @$"Hi {vendor.Name}, this is Aimee from Mila Realty. We have and {request.Category} issue at
                            13 Prairie Dr. Orlando (tenant {request.User} - {request.Phone}). 
                            
                            {request.Issue}.

        Can you take this job and contact the tenant directly to schedule a time that works for both of you?.

        Please, reply to confirm you are available";
                
        return await Task.FromResult(new Demo.ServiceAvailabilityResponse(requestMessage, DateTime.UtcNow.ToLongDateString()));
    }

    public async Task<Demo.VendorAvailabilityResponse> GetVendorAvailabilityResponse()
    {
        var response = new Demo.VendorAvailabilityResponse("Hi Aimee, Yes I am available and I will take the job. I will contact the tenant ASAP", DateTime.UtcNow.ToLongDateString(), true);
        return await Task.FromResult(response);
    }
    
    public async Task<Demo.InformTenantVendorContactResponse> InformTenantAboutVendorContact(Demo.InformTenantVendorContact request)
    {
        var vendor = _supplierService.GetSuppliers().First();
        var message = $"Hi {request.User}, Quick update. {vendor.Name} from {vendor.Name} will be reaching you out shortly to coordinate a time that works best for both of you";
        var response = new Demo.InformTenantVendorContactResponse(message, DateTime.UtcNow.ToLongDateString());
        return await Task.FromResult(response);
    }

    public async Task<Demo.VendorMessageToAgent> VendorConfirmScheduledVisit()
    {
        var message = "Hi Aimee. I called the tenant and I am going to swing  by today around 4pm. I'll let you know once I have a diagnosis";
        return await Task.FromResult(new Demo.VendorMessageToAgent(message, DateTime.UtcNow.ToLongDateString()));
    }
}