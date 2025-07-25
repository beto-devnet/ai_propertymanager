using Microsoft.AspNetCore.Mvc;
using ticketApi.Models.ChatGpt;
using ticketApi.Services.AIServices;

namespace ticketApi.Controllers
{
    [Route("api/chat")]
    [ApiController]
    public class ChatGptController : ControllerBase
    {
        private readonly ChatGptService _chatGptService;

        public ChatGptController(ChatGptService chatGptService)
        {
            _chatGptService = chatGptService;
        }

        [HttpGet("start-thread")]
        public async Task<IActionResult> StartThead()
        {
            var result = await _chatGptService.StartThread();
            return Ok(result);
        }
        
        [HttpPost("issue")]
        public async Task<IActionResult> IssueRequest([FromBody]IssueRequest request)
        {
            var response = await _chatGptService.IssueRequest(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processAimeeMessage")]
        public async Task<IActionResult> ProcessAimeeMessage([FromBody]MessageRequest request)
        {
            var response = await _chatGptService.AimeeMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }

        [HttpPost("processVendorMessage")]
        public async Task<IActionResult> ProcessVendorMessage(MessageRequest request)
        {
            var response = await _chatGptService.VendorMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processTenantMessage")]
        public async Task<IActionResult> ProcessTenantMessage(MessageRequest request)
        {
            var response = await _chatGptService.TenantMessage(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }

        #region FakeEndpoints

        [HttpPost("issue-fake")]
        public async Task<IActionResult> IssueRequestFake([FromBody]IssueRequest request)
        {
            var response = await _chatGptService.IssueRequestFake(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processVendorMessage-fake/{type}")]
        public async Task<IActionResult> ProcessVendorMessage([FromRoute]string type, MessageRequest request)
        {
            var response = await _chatGptService.VendorMessageFake(request, type);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }
        
        [HttpPost("processTenantMessage-fake")]
        public async Task<IActionResult> ProcessTenantMessageFake(MessageRequest request)
        {
            var response = await _chatGptService.TenantMessageFake(request);
            return response.Match(Ok, e => StatusCode(500, e.First().Description));
        }

        #endregion
    }
}
