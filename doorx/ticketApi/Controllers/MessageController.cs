using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using ticketApi.Models;
using ticketApi.Services;
using ticketApi.Services.GeminiServices;

namespace ticketApi.Controllers
{
    [Route("api/message")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly DemoActions _demoActions;

        public MessageController(DemoActions demoActions)
        {
            _demoActions = demoActions;
        }

        [HttpGet("prompt/{propertyId}")]
        public async Task<IActionResult> GetPrompt(int propertyId)
        {
            var result = _demoActions.GeneratePrompt(propertyId);
            return await Task.FromResult(Ok(result));
        }
        
        [HttpGet("all-properties-brief")]
        public async Task<IActionResult> GetAllPropertiesBrief()
        {
            var properties = _demoActions.GetAllPropertiesBrief;
            return await Task.FromResult(Ok(properties));
        }
        
        [HttpGet("all-properties")]
        public async Task<IActionResult> GetAllProperties()
        {
            var properties = _demoActions.GetAllProperties;
            return await Task.FromResult(Ok(properties));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(Models.Models.LoginRequest request)
        {
            var result = await Task.FromResult(_demoActions.Login(request.Id));
            return result.Match(Ok, e => StatusCode(500, e[0].Description));
        }
        
        [HttpGet("examples")]
        public IActionResult GetExamples()
        {
            return Ok(_demoActions.GetExamples());
        }

        [HttpGet("get-vendor/{category}")]
        public async Task<IActionResult> GetVendor(string category)
        {
            var vendor = await _demoActions.GetRandomVendor(category);
            return Ok(vendor);
        }

        [HttpPost("process-issue")]
        public async Task<IActionResult> ProcessIssue(Models.Models.AssistantRequest request)
        {
            var result = await _demoActions.ProcessIssue(request);
            return result.Match(Ok, failure => StatusCode(500, failure[0].Description));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] Demo.Message.SendMessageRequest request)
        {
            var result = await _demoActions.SendMessage(request);
            return await Task.FromResult(Ok(result));
        }

        [HttpPost("receive")]
        public async Task<IActionResult> ReceiveMessage([FromBody] Demo.Message.ReceiveMessageRequest request)
        {
            var response = await _demoActions.ReceiveMessage(request);
            return Ok(response);
        }
        
        
        #region OLD METHOD
        // [HttpPost("service-availability-message")]
        // public async Task<IActionResult> GetServiceAvailabilityMessage(Demo.ServiceAvailabilityRequest request)
        // {
        //     var serviceAvailabilityMessage = _demoServices.ServiceAvailabilityMessage(request);
        //     return await serviceAvailabilityMessage.Match(Ok, error => StatusCode(500, error[0].Description));
        // }
        //
        // [HttpGet("vendor-availability-response")]
        // public async Task<IActionResult> GetVendorAvailabilityResponse()
        // {
        //     return Ok(await _demoServices.GetVendorAvailabilityResponse());
        // }
        //
        // [HttpPost("inform-tenant-vendor-contact")]
        // public async Task<IActionResult> InformToTenantAboutContactFromVendor(Demo.InformTenantVendorContact request)
        // {
        //     return Ok(await _demoServices.InformTenantAboutVendorContact(request));
        // }
        //
        // [HttpGet("get-vendor-message")]
        // public async Task<IActionResult> GetVendorMessageConfirmationVisit()
        // {
        //     return Ok(await _demoServices.VendorConfirmScheduledVisit());
        // }
        //
        // [HttpPost("inform-tenant-visit-time")]
        // public async Task<IActionResult> InformTenantVisitTime(Demo.AimeeMessageToTenantRequest request)
        // {
        //     return Ok(await _demoServices.InformTenantAboutVisitTime(request));
        // }
        //
        // [HttpPost("fix-completed")]
        // public async Task<IActionResult> VendorInformFixHasCompleted(Demo.FixHasCompletedRequest request)
        // {
        //     return Ok(await _demoServices.FixHasCompleted(request));
        // }
        //
        // [HttpPost("message-to-vendor-fixed-issue")]
        // public async Task<IActionResult> IssueFixedResponse(Demo.ReplyToVendorIssueFixedRequest request)
        // {
        //     return Ok(await _demoServices.ReplyToVendorIssueFixed(request));
        // }
        //
        // [HttpPost("message-to-tenant-close-ticket")]
        // public async Task<IActionResult> MessageToCloseTicket(Demo.MessageToTenantCloseTicketRequest request)
        // {
        //     return Ok(await _demoServices.MessageToTenantCloseTicket(request));
        // }
        //
        // [HttpPost("tenant-to-aimee-close-ticket")]
        // public async Task<IActionResult> CloseTicket(Demo.TenantResponseToCloseTicketRequest request)
        // {
        //     return Ok(await _demoServices.TenantResponseCloseTicket(request));
        // }
        
        #endregion
    }
}
