using System.Text.Json;
using ErrorOr;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol;
using ticketApi.Models;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/message")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly DemoServices _demoServices;
        private readonly DemoActions _demoActions;

        public MessageController(DemoServices demoServices, DemoActions demoActions)
        {
            _demoServices = demoServices;
            _demoActions = demoActions;
        }

        [HttpGet("examples")]
        public IActionResult GetExamples()
        {
            return Ok(_demoServices.GetExamples());
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
            var result = await _demoServices.ProcessIssue(request);
            return result.Match(Ok, failure => StatusCode(500, failure[0].Description));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] Demo.Message.SendMessageRequest request)
        {
            var result = await _demoActions.SendMessage(request);
            return await Task.FromResult(Ok(result));
        }
        
        

        [HttpPost("service-availability-message")]
        public async Task<IActionResult> GetServiceAvailabilityMessage(Demo.ServiceAvailabilityRequest request)
        {
            var serviceAvailabilityMessage = _demoServices.ServiceAvailabilityMessage(request);
            return await serviceAvailabilityMessage.Match(Ok, error => StatusCode(500, error[0].Description));
        }

        [HttpGet("vendor-availability-response")]
        public async Task<IActionResult> GetVendorAvailabilityResponse()
        {
            return Ok(await _demoServices.GetVendorAvailabilityResponse());
        }
        
        [HttpPost("inform-tenant-vendor-contact")]
        public async Task<IActionResult> InformToTenantAboutContactFromVendor(Demo.InformTenantVendorContact request)
        {
            return Ok(await _demoServices.InformTenantAboutVendorContact(request));
        }

        [HttpGet("get-vendor-message")]
        public async Task<IActionResult> GetVendorMessageConfirmationVisit()
        {
            return Ok(await _demoServices.VendorConfirmScheduledVisit());
        }

        [HttpPost("inform-tenant-visit-time")]
        public async Task<IActionResult> InformTenantVisitTime(Demo.AimeeMessageToTenantRequest request)
        {
            return Ok(await _demoServices.InformTenantAboutVisitTime(request));
        }

        [HttpPost("fix-completed")]
        public async Task<IActionResult> VendorInformFixHasCompleted(Demo.FixHasCompletedRequest request)
        {
            return Ok(await _demoServices.FixHasCompleted(request));
        }
        
        [HttpPost("message-to-vendor-fixed-issue")]
        public async Task<IActionResult> IssueFixedResponse(Demo.ReplyToVendorIssueFixedRequest request)
        {
            return Ok(await _demoServices.ReplyToVendorIssueFixed(request));
        }
        
        [HttpPost("message-to-tenant-close-ticket")]
        public async Task<IActionResult> MessageToCloseTicket(Demo.MessageToTenantCloseTicketRequest request)
        {
            return Ok(await _demoServices.MessageToTenantCloseTicket(request));
        }
        
        [HttpPost("tenant-to-aimee-close-ticket")]
        public async Task<IActionResult> CloseTicket(Demo.TenantResponseToCloseTicketRequest request)
        {
            return Ok(await _demoServices.TenantResponseCloseTicket(request));
        }
    }
}
