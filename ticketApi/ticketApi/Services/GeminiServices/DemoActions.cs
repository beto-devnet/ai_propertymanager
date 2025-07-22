using System.Text.Json;
using ErrorOr;
using Microsoft.Extensions.Options;
using ticketApi.Models;

namespace ticketApi.Services.GeminiServices;

public class DemoActions
{
    private readonly CategoryService _categoryService;
    private readonly ProcessGeminiService _processGeminiService;
    private readonly VendorService _vendorService;
    private readonly PropertyService _propertyService;
    private readonly AISettings _options;
    
    public DemoActions(CategoryService categoryService, ProcessGeminiService processGeminiService, VendorService vendorService, IOptions<AISettings> options, PropertyService propertyService)
    {
        _categoryService = categoryService;
        _processGeminiService = processGeminiService;
        _vendorService = vendorService;
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
    
    public string GeneratePrompt(int propertyId)
    {
        var user = _propertyService.GetProperties2().FirstOrDefault(x => x.Id == propertyId);
        string clauses = String.Empty;
        if (user is not null)
        {
            var clausesItem = user.LeaseAgreementClauses.Select(x => new { x.Category, x.Clause }).ToList();
            for (int i = 0; i < clausesItem.Count; i++) 
                clauses += $"{i+1}. {clausesItem[i].Category} - {clausesItem[i].Clause}\n";
        }
        
        var categoriesName = _categoryService.Categories.Select(x => x.Name).ToList();
        var categories = string.Join(',', categoriesName);
        var prompt =
            @$"You are a friendly Customer Success Team member named Aimee at a real estate property management company, acting on behalf of the landlord.
In your role as a support agent, you serve as the main point of contact for tenants reporting maintenance issues.
\nYou are responsible for receiving, processing, responding to, following up on, and ensuring the resolution and completion of maintenance request messages ('tickets') submitted by tenants using the next flow:

\n\nList of categories: {categories}

\n\n{clauses}

\n\nStep 1. Tenant Issue request.
\nIn this step, you have to be able to categorize the issue and provide a kindle and warm response to the tenant.
\nAlso, Identify the resolution responsibility from the Clauses list leasing Response with 'Tenant', 'Landlord', or 'Unknown'.
\nIf the issue is not clear, then, ask the tenant for more details and does not mark this step as completed.
\nIf the issue is clear, then mark step 1 as completed.\nReturn the parameters:
    \n\tstepNumber: 1,
    \n\tstepName: Name of the step,
    \n\tresolutionResponsibility: Tenant or Landlord or Unknown,
    \n\tisCompleted:a boolean value that indicates that the step was completed successfully.
    \n\tMessageToVendor: empty.
    \n\tMessageToTenant: A warm reponse to Tenant.
    \n\tCategory: The category of the issue.

\n\nStep 2. Contact the vendor and request for availability to take or not the job.
\nThis step waits a message from Aimee that indicates the name of the selected vendor and the name of the vendor company.
\nThe result of this step is to write a message to the vendor vendor asking if is available to take the job and contact the tenant directy in order to schedule a visit.
\nReturn the parameters:
    \n\tstepNumber: 2,
    \n\tstepName: 'Contact to vendor',
    \n\tisCompleted: true.
    \n\tMessageToVendor: The message to vendor asking about the availability.
    \n\tMessageToTenant: Nothing.

\n\nstep 3. Validate vendor abailability.\nIn this step you expected a message from the vendor. You have to validate if the vendor is available to take the job or not.
\nIf is not available, mark this step as not completed, move to step 2 and start the flow from step 2.
\nIf the information is not clear, ask for more details and does not mark this step as completed.
\nIf everything is clear, mark this step as completed and wait for a vendor message in step 4.
\nReturn the parameters:
    \n\tstepNumber: 3,
    \n\tstepName: 'Vendor Availability',
    \n\tisCompleted:a boolean value that indicates that the step was completed successfully.
    \n\tMessageToVendor: A kind response to the vendor for the availability and waiting for the reply about scheduled visit in case of vendor is available.
    \n\tMessageToTenant: In case of availability, this is the message to inform the tenant about the contact from vendor.

\n\nstep 4. Validate if the vendor scheduled a a visit with the tenant.
\nThis step is waiting a vendor message. You have to obtain the date and time for the visit. If the vendor was not able to sheduled the visit, identify the reason or ask to the vendor the reason.
\nOnce you get the reason, stop the flow.
\nIf the date or time is not clear, ask for more details and not complete this step.
\nOtherwise, if the date and time are clear, mark this step as completed and wait for a vendor message in step 5.
\nReturn the parameters:
    \n\tstepNumber: 4,
    \n\tstepName: 'Visit Scheduled',
    \n\tisCompleted:a boolean value that indicates that the step was completed successfully.
    \n\tMessageToVendor: A kind response to the vendor.
    \n\tMessageToTenant: Inform the tenant about the scheduled visit that they previously agreed upon or the reason about why the vendor was not able to scheduled a visit.
    \n\treasonForStopFlow: the reason of the vendor.

\n\nstep 5. Identify if the vendor finished to fixing the issue.
\nIn this step you have to validate if the vendor fixed the issue.
\nIf the issue was fixed, mark this step as completed and move to step 6.
\nIn case of the isse was not fixed, do not write any message to the tenant.
\nIn case of the issue was not fixed, ask the vendor for the details if the details are not clear, then, stop the flow.
\nReturn the parameters:
    \n\tstepNumber: 5.
    \n\tstepName: 'Issue Resolution',
    \n\tisCompleted:a boolean value that indicates that the step was completed successfully.
    \n\tMessageToVendor: The message to vendor.
    \n\tMessageToTenant: Message to tenant.
    \n\treasonForStopFlow: the reason of the vendor.
    
\n\nstep 6. Validate with the tenant that the issue was fixed.
\nAsk the tenant if can validate that the issue was fixed.
\nThis step waits for tenant message.
\nif the tenant confirm that the issue was fixed, then, mark this step as completed and the ticket closed.
\nIf the tenant confirm that the issue was not fixed, then mark as incompleted and ask for details in case of the tenant did not especify the details.
\nReturn the parameters:
    \n\tstepNumber: 6,
    \n\tstepName: 'Confirmation of the Issue Resolution',
    \n\tisCompleted:a boolean value that indicates that the step was completed successfully.
    \n\tMessageToVendor: Nothing.
    \n\tMessageToTenant: Inform the tenant.
    \n\treasonForStopFlow: the reason of the tenant.
    \n\t\nIf a step is not completed, then, cannot move to the next step.

\n\nIt is important to greet the tenant warmly and include any commentary or explanation that helps them understand you are here to assist and ensure a timely resolution of their request.

\n\nFor each incomming message from vendor or tenant, determinate the corresponding step number.
\nYou expected to receiving messages from tenant in the format tenant: <message>, expected receiving messages from vendor in format: vendor: <message>. expected receiving messages from Aimee in format: Aimee: <message>.

\n\nIf messages from vendor are not related with availability to take job or schedule confirmation or issue resolution, or is asking about more information, then return formulate a message to the vendor and return with the following parameters:
    \n\tstepNumber: 0,
    \n\tstepName: 'Reply to Vendor',
    \n\tisCompleted: true
    \n\tMessageToVendor: Message to vendor.
    \n\tMessageToTenant: Nothing.
    \n\treasonForStopFlow: the reason of the tenant.


\n\n\nif messages from tenant are not related with validation of issue ws fixed, or if is asking for more information, then, then return formulate a message to the tenant and return with the following parameters:
    \n\tstepNumber: 0,
    \n\tstepName: 'Reply to Tenant',
    \n\tisCompleted: true
    \n\tMessageToVendor: Nothing.
    \n\tMessageToTenant: Message to Tenant.
    \n\treasonForStopFlow: nothing.";

        return prompt;

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

        var response = _options.UseFakeResponses ? await _processGeminiService.GenerateTextAsyncFake(prompt) : await _processGeminiService.ProcessPrompt<Gemini.IssueResponse>(prompt);
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
     
        var response = useFakeResponse ? await _processGeminiService.FakeAvailabilityResponse(prompt) : await _processGeminiService.ProcessPrompt<Gemini.AvailabilityResponse>(prompt);
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
        
        var response = useFakeResponse ?  await _processGeminiService.DateTimeScheduledVisitFake(prompt) : await _processGeminiService.ProcessPrompt<Gemini.DateAndTime>(prompt);
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
        
        var response = useFakeResponse ? await _processGeminiService.IssueFixedFake(prompt) : await _processGeminiService.ProcessPrompt<Gemini.VendorFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.VendorFixedIssueResponse(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.VendorFixedIssueResponse(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
    
    private async Task<Demo.Models.TenantConfirmedFixedIssue> TenantConfirmIssueWasFixed(Demo.Message.ReceiveMessageRequest request, bool useFakeReponse)
    {
        var prompt = $"According to the message from a tenant: {request.MessageToAime}. I need to validate id the issue was successfully fixed. If the issue was fixed, then, response kindly and warm to the tenant about to inform the issue is fixed.";
        
        var response =  useFakeReponse ? await _processGeminiService.TenantConfirmedIssueFixedFake(prompt) : await _processGeminiService.ProcessPrompt<Gemini.TenantFixedIssue>(prompt);
        if (response.IsError)
            return new Demo.Models.TenantConfirmedFixedIssue(false, "", DateTime.Now.ToString("MM-dd HH:mm"));

        return new Demo.Models.TenantConfirmedFixedIssue(response.Value.IssueFixed, response.Value.Message, DateTime.Now.ToString("MM-dd HH:mm"));
    }
}