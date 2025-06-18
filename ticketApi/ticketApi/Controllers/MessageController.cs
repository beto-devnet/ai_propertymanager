using ErrorOr;
using Microsoft.AspNetCore.Mvc;
using ticketApi.Models;
using ticketApi.Services;

namespace ticketApi.Controllers
{
    [Route("api/message")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly DemoServices _demoServices;

        public MessageController(DemoServices demoServices) => _demoServices = demoServices;

        [HttpGet("examples")]
        public IActionResult GetExamples()
        {
            return Ok(_demoServices.GetExamples());
        }

        [HttpPost("process-issue")]
        public async Task<IActionResult> ProcessIssue(Models.Models.AssistantRequest request)
        {
            var result = await _demoServices.ProcessIssue(request);
            return result.Match(Ok, failure => StatusCode(500, failure[0].Description));
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
